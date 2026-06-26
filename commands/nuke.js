const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nuke',
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const position = message.channel.position;
        const parent = message.channel.parent_id;

        const newChannel = await message.channel.clone();
        await newChannel.setPosition(position);
        if (parent) await newChannel.setParent(parent);

        await message.channel.delete();
        newChannel.send('💥 **SALON NUKE** - Réinitialisation complète.');
    }
};