const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// Système Anti-Spam basique (en mémoire)
const userMessageMap = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // --- ANTI-LINK ---
        if (message.content.match(/(https?:\/\/[^\s]+)/g) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await message.delete();
            return message.channel.send({ content: `⚠️ <@${message.author.id}>, les liens sont interdits.` }).then(m => setTimeout(() => m.delete(), 5000));
        }

        // --- ANTI-SPAM ---
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const limit = 5; // 5 messages max
            const time = 5000; // en 5 secondes
            
            if (!userMessageMap.has(message.author.id)) {
                userMessageMap.set(message.author.id, { count: 1, timer: setTimeout(() => userMessageMap.delete(message.author.id), time) });
            } else {
                const userData = userMessageMap.get(message.author.id);
                userData.count++;
                if (userData.count > limit) {
                    await message.member.timeout(60 * 1000, 'Spam détecté'); // Mute 1 minute
                    return message.channel.send(`🔇 <@${message.author.id}> a été rendu muet pour spam.`);
                }
            }
        }

        // --- GESTION DES COMMANDES ---
        if (!message.content.startsWith(client.prefix)) return;

        const args = message.content.slice(client.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }
};