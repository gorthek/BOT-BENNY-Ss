const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// 🎯 METS L'ID DE TON SALON LOGS-MODERATION ICI :
const SANCTION_CHANNEL_ID = '1520092317241839718'; 

module.exports = {
    name: 'mute',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission d\'isoler (mute) des membres.');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Veuillez mentionner le membre à mute.');

        const durationMinutes = parseInt(args[1]);
        if (!durationMinutes || isNaN(durationMinutes)) {
            return message.reply('❌ Durée invalide ! Spécifiez le temps en minutes.\n**Exemple :** `+mute @pseudo 10 Raison`');
        }

        const reason = args.slice(2).join(' ') || 'Aucune raison fournie';
        const durationMs = durationMinutes * 60 * 1000;

        await target.timeout(durationMs, reason).catch(err => {
            console.error(err);
            return message.reply('❌ Impossible d\'isoler ce membre.');
        });

        const embed = new EmbedBuilder()
            .setTitle('🔇 Mise en Sourdine (Timeout)')
            .setColor('#6c5ce7')
            .addFields(
                { name: '👤 Membre restreint', value: `${target.user.tag}`, inline: true },
                { name: '⏳ Durée', value: `${durationMinutes} minute(s)`, inline: true },
                { name: '🛡️ Modérateur', value: `<@${message.author.id}>`, inline: false },
                { name: '📝 Raison', value: reason }
            )
            .setTimestamp();

        const logChannel = await message.guild.channels.fetch(SANCTION_CHANNEL_ID).catch(() => null);
        if (logChannel) {
            await logChannel.send({ embeds: [embed] }).catch(console.error);
        }

        await message.delete().catch(() => {});
        return message.channel.send(`🔇 **${target.user.username}** a été rendu muet pour **${durationMinutes}m**.`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
};
