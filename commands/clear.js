const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clear',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Veuillez spécifier un nombre entre 1 et 100.');
        }

        await message.channel.bulkDelete(amount, true);
        message.channel.send(`✅ ${amount} messages supprimés.`).then(m => setTimeout(() => m.delete(), 3000));
    }
};