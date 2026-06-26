const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// 🎯 METS L'ID DE TON SALON LOGS-MODERATION ICI :
const SANCTION_CHANNEL_ID = 'TON_ID_DE_SALON_ICI'; 

module.exports = {
    name: 'ban',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de bannir des membres.');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Veuillez mentionner le membre à bannir.');
        if (!target.bannable) return message.reply('❌ Impossible de bannir ce membre (Rôle supérieur ou permissions manquantes).');

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

        // On bannit le joueur
        await target.ban({ reason: reason }).catch(console.error);

        // Création de l'embed large pour les logs
        const embed = new EmbedBuilder()
            .setTitle('🔨 Bannissement Définitif')
            .setColor('#d63031')
            .addFields(
                { name: '👤 Membre banni', value: `${target.user.tag} (\`${target.id}\`)`, inline: true },
                { name: '🛡️ Modérateur', value: `<@${message.author.id}>`, inline: true },
                { name: '📝 Raison', value: reason }
            )
            .setTimestamp();

        // 🚀 Envoi direct de l'embed dans le salon de sanction
        const logChannel = await message.guild.channels.fetch(SANCTION_CHANNEL_ID).catch(() => null);
        if (logChannel) {
            await logChannel.send({ embeds: [embed] }).catch(console.error);
        } else {
            console.error(`[ERREUR] Salon de sanction introuvable (ID: ${SANCTION_CHANNEL_ID})`);
        }

        // Petit message de confirmation temporaire dans le salon actuel
        await message.delete().catch(() => {});
        return message.channel.send(`✅ **${target.user.username}** a été banni définitivement. Log envoyé dans <#${SANCTION_CHANNEL_ID}>.`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
};
