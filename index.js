require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Serveur Web pour Clever Cloud
const app = express();
app.get('/', (req, res) => res.send('Bot Benny\'s en ligne !'));
app.listen(process.env.PORT || 8080, () => console.log('🌐 Serveur Web opérationnel.'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.prefix = '+';

// --- Chargement des Commandes ---
const loadCommands = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            loadCommands(path.join(dir, file.name));
        } else if (file.name.endsWith('.js')) {
            const command = require(path.join(__dirname, dir, file.name));
            if (command.name) client.commands.set(command.name, command);
        }
    }
};
loadCommands('./commands');

// --- Chargement des Événements ---
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(process.env.TOKEN);