const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // ID du salon des bilans à configurer
        const BILAN_CHANNEL_ID = process.env.BILAN_CHANNEL_ID || '1520040763738558534'; 

        // On vérifie si on est dans le bon salon et si le message a une pièce jointe
        if (message.channel.id === BILAN_CHANNEL_ID && !message.author.bot) {
            if (message.attachments.size > 0) {
                const attachment = message.attachments.first();

                // Vérifier si c'est bien un .txt
                if (attachment.name.endsWith('.txt')) {
                    
                    // 1. Création de l'embed
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('📄 Nouveau Bilan Journalier')
                        .setDescription(`L'employé **${message.author.username}** a envoyé son bilan.`)
                        .addFields({ name: 'Fichier', value: `[Télécharger le bilan](${attachment.url})` })
                        .setTimestamp();

                    // 2. Envoyer l'embed avec le fichier en pièce jointe
                    await message.channel.send({ embeds: [embed], files: [attachment] });

                    // 3. Supprimer le message original de l'utilisateur
                    await message.delete().catch(err => console.error("Erreur suppression message :", err));
                }
            }
        }
    }
};