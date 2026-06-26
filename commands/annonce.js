const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'annonce',
    async execute(message, args, client) {
        // Sécurité : Seul le staff avec la permission de mentionner ou admin peut faire une annonce
        if (!message.member.permissions.has(PermissionsBitField.Flags.MentionEveryone) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous n\'avez pas la permission d\'utiliser cette commande.');
        }

        // 1. Récupération du salon ciblé
        const targetChannel = message.mentions.channels.first();
        if (!targetChannel) {
            return message.reply('❌ Veuillez mentionner un salon valide.\n**Exemple :** `+annonce #annonces Mon Titre | Contenu de l\'annonce`');
        }

        // 2. Extraction du texte
        const contentRaw = args.slice(1).join(' ');
        if (!contentRaw) {
            return message.reply('❌ Veuillez fournir un contenu pour l\'annonce.');
        }

        // Découpage automatique avec le caractère "|"
        const parts = contentRaw.split('|');
        const title = parts[0]?.trim() || '📢 ANNONCE OFFICIELLE';
        const description = parts[1] ? parts[1].trim() : parts[0].trim();

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('#ffaa00') // Belle couleur dorée / orange
            .setTimestamp()
            .setFooter({ text: `Annonce publiée par ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        // Envoi dans le salon cible et nettoyage de la commande brute
        await targetChannel.send({ embeds: [embed] }).catch(console.error);
        await message.delete().catch(() => {});

        return message.channel.send(`✅ Annonce envoyée avec succès dans <#${targetChannel.id}> !`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }
};
