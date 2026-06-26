const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Bot Benny's opérationnel : ${client.user.tag}`);
        client.user.setActivity('Supervision de l\'atelier', { type: 3 });
    },
};