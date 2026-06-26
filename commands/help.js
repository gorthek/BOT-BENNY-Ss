const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    async execute(message, args, client) {
        // Récupère dynamiquement le préfixe du bot (ou '+' par défaut)
        const p = client.prefix || '+';

        const embed = new EmbedBuilder()
            .setTitle('📚 CENTRE D\'AIDE - BENNY\'S BOT')
            .setDescription(`Voici la liste complète des commandes et des systèmes automatisés disponibles sur le serveur.\nMon préfixe actuel est : \`${p}\``)
            .setColor('#3498db') // Un beau bleu pro et large
            .addFields(
                {
                    name: '🛡️ COMPTEUR & MODÉRATION',
                    value: [
                        `\`${p}ban @membre [raison]\` ➜ Bannit un utilisateur définitivement.`,
                        `\`${p}kick @membre [raison]\` ➜ Expulse un utilisateur du serveur.`,
                        `\`${p}mute @membre [minutes] [raison]\` ➜ Met un utilisateur en sourdine (Timeout).`,
                        `\`${p}unmute @membre [raison]\` ➜ Retire la sourdine d'un utilisateur.`,
                        `\`${p}clear [nombre]\` ➜ Supprime un nombre de messages défini.`,
                        `\`${p}nuke\` ➜ Réinitialise et purge entièrement le salon actuel.`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📢 GESTION & DIRECTION',
                    value: [
                        `\`${p}annonce #salon Titre | Message\` ➜ Publie une annonce officielle en embed.`,
                        `\`${p}help\` ➜ Affiche ce menu d'assistance.`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '💼 ENTREPRISE & ENREGISTREMENTS',
                    value: [
                        `⏱️ **Pointage & Suivi** ➜ Prise de service et calcul automatique du temps de présence.`,
                        `📄 **Dépôt des Bilans** ➜ Traitement automatisé et sécurisé de vos fichiers \`.txt\` de fin de service.`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🔒 INFRASTRUCTURE & SÉCURITÉ',
                    value: [
                        `📩 **Système de Ticket** ➜ Ouverture, gestion et archivage propre des demandes d'aide.`,
                        `🛡️ **Anti-Spam / Anti-Link** ➜ Protections actives en arrière-plan contre les abus et les liens non autorisés.`
                    ].join('\n'),
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Demandé par ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL({ dynamic: true }) 
            });

        return message.reply({ embeds: [embed] });
    }
};
