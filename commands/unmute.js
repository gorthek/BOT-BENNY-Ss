const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// 🎯 METS L'ID DE TON SALON LOGS-MODERATION ICI :
const SANCTION_CHANNEL_ID = '1520092317241839718'; 

module.exports = {
    name: 'unmute',
    async execute(message, args, client) {
        // Même permission nécessaire que pour le mute (Gérer les membres / Isoler les membres)
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de retirer la sourdine des membres.');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Veuillez mentionner le membre à unmute.');

        // Vérification optionnelle : Est-ce que le joueur est vraiment mute ?
        if (!target.communicationDisabledUntilTimestamp || target.communicationDisabledUntilTimestamp < Date.now()) {
            return message.reply('❌ Ce membre n\'est pas actuellement en sourdine.');
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie / Retrait anticipé';

        // 🔓 On passe "null" pour annuler immédiatement le timeout actif
        await target.timeout(null, reason).catch(err => {
            console.error(err);
            return message.reply('❌ Impossible de retirer la sourdine de ce membre.');
        });

        // Embed vert pour signifier la fin ou le retrait d'une sanction
        const embed = new EmbedBuilder()
            .setTitle('🔊 Retrait de Sourdine (Unmute)')
            .setColor('#2ecc71') // Un beau vert "action positive"
            .addFields(
                { name: '👤 Membre libéré', value: `${target.user.tag} (\`${target.id}\`)`, inline: true },
                { name: '🛡️ Modérateur', value: `<@${message.author.id}>`, inline: true },
                { name: '📝 Raison du retrait', value: reason, inline: false }
            )
            .setTimestamp();

        // 🚀 Envoi direct dans ton salon logs-moderation
        const logChannel = await message.guild.channels.fetch(SANCTION_CHANNEL_ID).catch(() => null);
        if (logChannel) {
            await logChannel.send({ embeds: [embed] }).catch(console.error);
        }

        // Nettoyage et confirmation
        await message.delete().catch(() => {});
        return message.channel.send(`🔊 **${target.user.username}** a récupéré la parole. Log envoyé dans <#${SANCTION_CHANNEL_ID}>.`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
};
