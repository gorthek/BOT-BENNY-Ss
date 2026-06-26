const { EmbedBuilder, PermissionsBitField } = require('discord.js');

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

        return message.channel.send({ embeds: [embed] });
    }
};
