const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'ticket',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('❌ Utilisation : `+ticket [setup | add | remove | rename | close]`');
        }

        const action = args[0].toLowerCase();

        // -----------------------------------------------------
        // 1. SETUP DU PANEL
        // -----------------------------------------------------
        if (action === 'setup') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

            const embed = new EmbedBuilder()
                .setColor('#34495e')
                .setTitle('📬 CONTACTER LA DIRECTION')
                .setDescription('Cliquez sur un bouton ci-dessous pour ouvrir un ticket.\n\n> 🛠️ **Recrutement**\n> ❓ **Question / Partenariat**')
                //.setImage('URL_BANNIERE_TICKET');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_recrutement').setLabel('🛠️ Recrutement').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('ticket_question').setLabel('❓ Question').setStyle(ButtonStyle.Secondary)
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // -----------------------------------------------------
        // 2. AJOUTER UN MEMBRE (add)
        // -----------------------------------------------------
        if (action === 'add') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Veuillez mentionner un utilisateur à ajouter.');

            await message.channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            return message.channel.send(`✅ <@${user.id}> a été ajouté au ticket.`);
        }

        // -----------------------------------------------------
        // 3. RETIRER UN MEMBRE (remove)
        // -----------------------------------------------------
        if (action === 'remove') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Veuillez mentionner un utilisateur à retirer.');

            await message.channel.permissionOverwrites.delete(user.id);
            return message.channel.send(`⛔ <@${user.id}> a été retiré du ticket.`);
        }

        // -----------------------------------------------------
        // 4. RENOMMER LE TICKET (rename)
        // -----------------------------------------------------
        if (action === 'rename') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
            const newName = args.slice(1).join('-');
            if (!newName) return message.reply('❌ Veuillez indiquer un nouveau nom (ex: `+ticket rename recrue-mathys`).');

            await message.channel.setName(newName);
            return message.channel.send(`✅ Ticket renommé en : \`${newName}\``);
        }

       // -----------------------------------------------------
        // 5. FERMETURE DU TICKET ET LOGS HTML (close)
        // -----------------------------------------------------
        if (action === 'close') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
            
            await message.reply('⏳ Fermeture et archivage du ticket en cours...');

            const channel = message.channel;
            const messagesList = await channel.messages.fetch({ limit: 100 });
            
            // Construction du fichier HTML
            let htmlContent = `
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Log Ticket : ${channel.name}</title>
                    <style>
                        body { background: #36393f; color: #dcddde; font-family: sans-serif; padding: 20px; }
                        h1 { color: #ffffff; border-bottom: 1px solid #72767d; padding-bottom: 10px; }
                        .message { margin-bottom: 15px; }
                        .author { font-weight: bold; color: #7289da; margin-right: 10px; }
                        .content { display: inline; }
                        .date { font-size: 0.8em; color: #72767d; margin-left: 10px; }
                    </style>
                </head>
                <body>
                    <h1>Archive du ticket : ${channel.name}</h1>
            `;

            // Ajout des messages chronologiquement
            messagesList.reverse().forEach(msg => {
                const date = msg.createdAt.toLocaleString('fr-FR');
                htmlContent += `
                    <div class="message">
                        <span class="author">${msg.author.username}</span>
                        <span class="date">[${date}]</span><br>
                        <span class="content">${msg.content}</span>
                    </div>
                `;
            });

            htmlContent += `</body></html>`;

            // Création du fichier sur le PC/Serveur
            const filePath = `./ticket_logs_${channel.id}.html`;
            fs.writeFileSync(filePath, htmlContent);

            // Envoi dans le salon des logs
            const logChannelId = process.env.LOG_CHANNEL_ID || '1520077010498748598';
            const logChannel = message.guild.channels.cache.get(logChannelId); 
            
            if (logChannel) {
                const attachment = new AttachmentBuilder(filePath);
                const logEmbed = new EmbedBuilder()
                    .setTitle('📜 Ticket Fermé et Archivé')
                    .addFields(
                        { name: 'Nom du ticket', value: channel.name, inline: true },
                        { name: 'Fermé par', value: `<@${message.author.id}>`, inline: true }
                    )
                    .setColor('#2c3e50')
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed], files: [attachment] });
            } else {
                console.log("⚠️ Salon des logs introuvable. N'oublie pas de configurer l'ID !");
            }

            // Suppression du fichier HTML local et du salon Discord
            fs.unlinkSync(filePath);
            await channel.delete();
        }
    }
};
