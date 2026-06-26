const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// 🎯 METS L'ID DE TON SALON LOGS-MODERATION ICI :
const SANCTION_CHANNEL_ID = '1520092317241839718'; 

module.exports = {
    name: 'kick',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission d\'expulser des membres.');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Veuillez mentionner le membre à expulser.');
        if (!target.kickable) return message.reply('❌ Impossible d\'expulser ce membre.');

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

        // On kick le joueur
        await target.kick(reason).catch(console.error);

        const embed = new EmbedBuilder()
            .setTitle('👢 Expulsion du Serveur')
            .setColor('#e17055')
            .addFields(
                { name: '👤 Membre expulsé', value: `${target.user.tag} (\`${target.id}\`)`, inline: true },
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

        await message.delete().catch(() => {});
        return message.channel.send(`👢 **${target.user.username}** a été expulsé. Log envoyé dans <#${SANCTION_CHANNEL_ID}>.`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
};
