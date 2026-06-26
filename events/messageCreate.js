const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// Système Anti-Spam basique (en mémoire)
const userMessageMap = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // ==========================================================
        // 🔒 SÉCURITÉ : GESTION ET INTERCEPTION DU SALON DES BILANS
        // ==========================================================
        const BILAN_CHANNEL_ID = '1520076766218031235'; // Ton salon de dépôt

        if (message.channel.id === BILAN_CHANNEL_ID) {
            // Sécurité au cas où la Map n'est pas initialisée dans index.js
            if (!client.pendingBilans) client.pendingBilans = new Map();

            // 🛑 1. Le joueur a-t-il le droit de poster ? (Est-il en attente de bilan ?)
            if (!client.pendingBilans.has(message.author.id)) {
                await message.delete().catch(() => {});
                const warning = await message.channel.send(`❌ <@${message.author.id}>, vous ne pouvez pas déposer de bilan sans avoir fait une "Fin de service" au préalable.`);
                return setTimeout(() => warning.delete().catch(() => {}), 5000);
            }

            // 🛑 2. Le joueur a bien envoyé un fichier ?
            if (message.attachments.size > 0) {
                const attachment = message.attachments.first();

                // 🛑 3. Le fichier est-il bien un .txt ?
                if (attachment.name.endsWith('.txt')) {
                    
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('📄 Nouveau Bilan Journalier')
                        .setDescription(`L'employé **${message.author.username}** a déposé son bilan.`)
                        .addFields({ name: 'Fichier', value: `[Télécharger le bilan](${attachment.url})` })
                        .setTimestamp();

                    // On envoie le bel embed final avec le fichier attaché
                    await message.channel.send({ embeds: [embed], files: [attachment] }).catch(console.error);

                    // 🧹 NETTOYAGE : Supprime l'ancien message du bot qui contenait le bouton "Ignorer"
                    const promptMessageId = client.pendingBilans.get(message.author.id);
                    if (promptMessageId) {
                        const promptMsg = await message.channel.messages.fetch(promptMessageId).catch(() => null);
                        if (promptMsg) await promptMsg.delete().catch(() => {});
                    }

                    // Supprime le message brut contenant le fichier déposé par le joueur
                    await message.delete().catch(() => {});

                    // On retire le joueur de la mémoire d'attente
                    client.pendingBilans.delete(message.author.id);

                } else {
                    // Si le joueur envoie autre chose qu'un .txt (ex: une image)
                    await message.delete().catch(() => {});
                    const warning = await message.channel.send(`⚠️ <@${message.author.id}>, seul le format \`.txt\` est accepté pour les bilans.`);
                    setTimeout(() => warning.delete().catch(() => {}), 5000);
                }
            } else {
                // Si le joueur écrit juste du texte sans joindre de fichier
                await message.delete().catch(() => {});
                const warning = await message.channel.send(`⚠️ <@${message.author.id}>, veuillez glisser votre fichier \`.txt\` pour valider votre fin de service.`);
                setTimeout(() => warning.delete().catch(() => {}), 5000);
            }

            return; // 🛑 ON CORRIGE LE BUG : Stop ici pour ce salon (évite l'anti-link et l'anti-spam)
        }

        // --- ANTI-LINK ---
        if (message.content.match(/(https?:\/\/[^\s]+)/g) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await message.delete();
            return message.channel.send({ content: `⚠️ <@${message.author.id}>, les liens sont interdits.` }).then(m => setTimeout(() => m.delete(), 5000));
        }

        // --- ANTI-SPAM ---
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const limit = 5; // 5 messages max
            const time = 5000; // en 5 secondes
            
            if (!userMessageMap.has(message.author.id)) {
                userMessageMap.set(message.author.id, { count: 1, timer: setTimeout(() => userMessageMap.delete(message.author.id), time) });
            } else {
                const userData = userMessageMap.get(message.author.id);
                userData.count++;
                if (userData.count > limit) {
                    await message.member.timeout(60 * 1000, 'Spam détecté'); // Mute 1 minute
                    return message.channel.send(`🔇 <@${message.author.id}> a été rendu muet pour spam.`);
                }
            }
        }

        // --- GESTION DES COMMANDES ---
        if (!message.content.startsWith(client.prefix)) return;

        const args = message.content.slice(client.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }
};
