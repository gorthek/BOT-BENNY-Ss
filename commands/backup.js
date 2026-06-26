const backup = require('discord-backup');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'backup',
    async execute(message, args) {
        // Uniquement le créateur du serveur ou les Administrateurs
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const action = args[0];

        if (action === 'create') {
            const m = await message.channel.send('⏳ Création de la sauvegarde en cours... Cela peut prendre un moment.');
            try {
                const backupData = await backup.create(message.guild, {
                    maxMessagesPerChannel: 10,
                    jsonSave: true,
                    jsonBeautify: true
                });
                
                const embed = new EmbedBuilder()
                    .setColor('#2ecc71')
                    .setTitle('✅ Sauvegarde Réussie !')
                    .setDescription(`L'ID de votre sauvegarde est : \`${backupData.id}\`\nGardez-le précieusement en sécurité.`)
                    .setFooter({ text: 'Pour charger : +backup load ' + backupData.id });

                await m.edit({ content: null, embeds: [embed] });
            } catch (error) {
                console.error(error);
                await m.edit('❌ Une erreur est survenue lors de la création de la sauvegarde.');
            }
        } 
        else if (action === 'load') {
            const backupId = args[1];
            if (!backupId) return message.reply('❌ Il faut préciser l\'ID de la sauvegarde : `+backup load <ID>`');

            message.reply('⚠️ **ATTENTION** ⚠️\nCharger une sauvegarde va **remplacer tout le serveur actuel** (Salons, Rôles, etc.).\nSi tu es sûr, tape `-confirm` dans les 10 secondes.');

            const filter = m => m.author.id === message.author.id && m.content === '-confirm';
            message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                .then(async () => {
                    message.channel.send('🔄 Démarrage de la restauration...');
                    backup.load(backupId, message.guild).catch(err => {
                        console.error(err);
                        message.author.send('❌ Erreur lors de la restauration.');
                    });
                })
                .catch(() => {
                    message.channel.send('🕒 Temps écoulé. Restauration annulée.');
                });
        } 
        else {
            message.reply('❌ Utilisation : `+backup create` ou `+backup load <ID>`');
        }
    }
};