const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'presence',
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🟢 POINTAGE BENNY\'S')
            .setDescription('**Prenez ou terminez votre service ici.**\n\n> 🟢 `Prise de service`\n> 🔴 `Fin de service` (Un rapport .txt vous sera demandé)')
           // .setImage('URL_IMAGE_LARGE_POINTAGE');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('service_in').setLabel('🟢 Prise de service').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('service_out').setLabel('🔴 Fin de service').setStyle(ButtonStyle.Danger)
        );

        const activeEmbed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('📋 Employés actuellement en service')
            .setDescription('Aucun employé en service pour le moment.');

        await message.channel.send({ embeds: [embed, activeEmbed], components: [row] });
        message.delete();
    }
};