const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, MessageFlags } = require('discord.js');
const fs = require('fs');

const activeServices = new Map();
const weeklyLogs = [];

const ROLE_EN_SERVICE = '1520033859566309469';
const ROLE_HORS_SERVICE = '1520033893879906384';

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const { customId, user, member, guild } = interaction;

        // ==========================================
        // 1. PRISE DE SERVICE
        // ==========================================
        if (customId === 'service_in') {
            if (activeServices.has(user.id)) {
                return interaction.reply({ content: '❌ Vous êtes déjà en service !', flags: [MessageFlags.Ephemeral] });
            }
            activeServices.set(user.id, Date.now());

            await member.roles.add(ROLE_EN_SERVICE).catch(console.error);
            await member.roles.remove(ROLE_HORS_SERVICE).catch(console.error);

            return interaction.reply({ content: '✅ Bonne prise de service !', flags: [MessageFlags.Ephemeral] });
        }

        // ==========================================
        // 2. FIN DE SERVICE
        // ==========================================
        if (customId === 'service_out') {
            if (!activeServices.has(user.id)) {
                return interaction.reply({ content: '❌ Vous n\'êtes pas en service !', flags: [MessageFlags.Ephemeral] });
            }

            const startTime = activeServices.get(user.id);
            const durationMs = Date.now() - startTime;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

            activeServices.delete(user.id);

            await member.roles.remove(ROLE_EN_SERVICE).catch(console.error);
            await member.roles.add(ROLE_HORS_SERVICE).catch(console.error);

            // 🔒 SÉCURITÉ : On lie l'ID de l'employé au bouton pour le rendre unique
            const skipRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`skip_bilan_${user.id}`).setLabel('⏭️ Ignorer le fichier txt').setStyle(ButtonStyle.Secondary)
            );

            const bilanChannelId = '1520076766218031235';
            const bilanChannel = await guild.channels.fetch(bilanChannelId).catch(() => null);

            weeklyLogs.push({ user: user.tag, id: user.id, duration: `${hours}h ${minutes}m`, date: new Date().toLocaleDateString('fr-FR') });

            if (bilanChannel) {
                const promptMessage = await bilanChannel.send({
                    content: `<@${user.id}> Fin de service ! Temps: **${hours}h ${minutes}m**.\nVeuillez envoyer votre fichier \`.txt\` de bilan ici, ou cliquez sur Ignorer.`,
                    components: [skipRow]
                }).catch(console.error);

                // On stocke l'ID du message pour pouvoir le supprimer automatiquement plus tard
                if (client.pendingBilans && promptMessage) {
                    client.pendingBilans.set(user.id, promptMessage.id);
                }
            } else {
                console.error(`[ERREUR] Salon des bilans introuvable (ID: ${bilanChannelId})`);
            }

            return interaction.reply({ content: '🔴 Fin de service validée. Rendez-vous dans le salon des bilans.', flags: [MessageFlags.Ephemeral] });
        }

        // ==========================================
        // 3. IGNORER LE BILAN (Vérification d'identité)
        // ==========================================
        if (customId.startsWith('skip_bilan_')) {
            const expectedUserId = customId.replace('skip_bilan_', '');

            // 🛑 Si quelqu'un d'autre clique sur le bouton, on le jette poliment
            if (user.id !== expectedUserId) {
                return interaction.reply({ content: '❌ Vous ne pouvez pas ignorer le bilan d\'un autre employé !', flags: [MessageFlags.Ephemeral] });
            }

            const reportChannelId = '1520076866973597826';
            const reportChannel = await guild.channels.fetch(reportChannelId).catch(() => null);
            
            if (reportChannel) {
                await reportChannel.send(`⚠️ L'employé <@${user.id}> a ignoré le dépôt de son fichier bilan journalier.`).catch(console.error);
            } else {
                console.error(`[ERREUR] Salon de rapport introuvable (ID: ${reportChannelId})`);
            }
            
            if (client.pendingBilans) client.pendingBilans.delete(user.id);
            
            await interaction.message.delete().catch(() => {});
            return interaction.reply({ content: '✅ Bilan ignoré.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
        }

        // ==========================================
        // 4. CRÉATION DES TICKETS
        // ==========================================
        if (customId === 'ticket_recrutement' || customId === 'ticket_question') {
            const ticketType = customId === 'ticket_recrutement' ? 'recrutement' : 'question';
            const staffRoleId = '1519791891611127919';

            const parentCategory = customId === 'ticket_recrutement' 
                ? '1520077067058679809'  
                : '1520077108301402192'; 

            try {
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

                const channel = await guild.channels.create({
                    name: `${ticketType}-${user.username}`,
                    type: ChannelType.GuildText,
                    parent: parentCategory,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        },
                        {
                            id: staffRoleId,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        }
                    ],
                });

                const embed = new EmbedBuilder()
                    .setTitle(`🎫 Ticket de ${ticketType.toUpperCase()}`)
                    .setDescription(`Bienvenue <@${user.id}> !\n\nLe staff va s'occuper de vous dès que possible.\n\nUtilisez \`+ticket close\` pour fermer ce ticket.`)
                    .setColor('#0099ff')
                    .setTimestamp();

                await channel.send({ content: `<@${user.id}> <@&${staffRoleId}>`, embeds: [embed] }).catch(console.error);
                await interaction.editReply({ content: `✅ Votre ticket a été créé avec succès ici : <#${channel.id}>` });

            } catch (error) {
                console.error("Erreur lors de la création du ticket :", error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création de votre ticket.' }).catch(() => {});
                }
            }
        }
    }
};
