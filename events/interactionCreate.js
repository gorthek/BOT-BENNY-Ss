const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');

// Base de données temporaire (En production, utiliser MongoDB si Clever Cloud redémarre souvent)
const activeServices = new Map();
const weeklyLogs = [];

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const { customId, user } = interaction;

        if (customId === 'service_in') {
            if (activeServices.has(user.id)) {
                return interaction.reply({ content: '❌ Vous êtes déjà en service !', ephemeral: true });
            }
            activeServices.set(user.id, Date.now());
            await interaction.reply({ content: '✅ Bonne prise de service !', ephemeral: true });
            // TODO: Mettre à jour l'embed "Employés en service" ici
        }

        if (customId === 'service_out') {
            if (!activeServices.has(user.id)) {
                return interaction.reply({ content: '❌ Vous n\'êtes pas en service !', ephemeral: true });
            }

            const startTime = activeServices.get(user.id);
            const durationMs = Date.now() - startTime;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            
            activeServices.delete(user.id);

            // Logique de Bilan
            const skipRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('skip_bilan').setLabel('⏭️ Ignorer le fichier txt').setStyle(ButtonStyle.Secondary)
            );

            // On ping l'utilisateur dans un salon privé de bilans
            const bilanChannelId = process.env.BILAN_CHANNEL_ID || '1520040763738558534';
            const bilanChannel = interaction.guild.channels.cache.get(bilanChannelId);
            
            weeklyLogs.push({ user: user.tag, id: user.id, duration: `${hours}h ${minutes}m`, date: new Date().toLocaleDateString('fr-FR') });

            await bilanChannel.send({ 
                content: `<@${user.id}> Fin de service ! Temps: **${hours}h ${minutes}m**.\nVeuillez envoyer votre fichier \`.txt\` de bilan ici, ou cliquez sur Ignorer.`,
                components: [skipRow]
            });

            await interaction.reply({ content: '🔴 Fin de service validée. Rendez-vous dans le salon des bilans.', ephemeral: true });
        }

        if (customId === 'skip_bilan') {
            const reportChannelId = process.env.REPORT_CHANNEL_ID || '1520040831862571098';
            const reportChannel = interaction.guild.channels.cache.get(reportChannelId);
            await reportChannel.send(`⚠️ L'employé <@${user.id}> a ignoré le dépôt de son fichier bilan journalier.`);
            await interaction.message.delete();
        }

        if (customId === 'ticket_recrutement' || customId === 'ticket_question') {
            const ticketType = customId === 'ticket_recrutement' ? 'recrutement' : 'question';
            const categoryId = '1520024622328713236';
            const staffRoleId = '1519791891611127919';

            await interaction.reply({ content: '⏳ Création de votre ticket...', ephemeral: true });

            try {
                const channel = await interaction.guild.channels.create({
                    name: `${ticketType}-${user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoryId || null,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        },
                        ...(staffRoleId ? [{
                            id: staffRoleId,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        }] : [])
                    ],
                });

                const embed = new EmbedBuilder()
                    .setTitle(`Ticket de ${ticketType}`)
                    .setDescription(`Bienvenue <@${user.id}> !\n\nLe staff vous répondra dès que possible.\n\nUtilisez \`+ticket close\` pour fermer ce ticket.`)
                    .setColor('#0099ff')
                    .setTimestamp();

                await channel.send({ content: `<@${user.id}> ${staffRoleId ? `<@&${staffRoleId}>` : ''}`, embeds: [embed] });
                await interaction.editReply({ content: `✅ Votre ticket a été créé : <#${channel.id}>` });
            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: '❌ Erreur lors de la création du ticket. Vérifiez les permissions du bot et les IDs dans le .env.' });
            }
        }
    }
};
