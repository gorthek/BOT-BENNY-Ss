const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
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
                return interaction.reply({ content: '❌ Vous êtes déjà en service !', ephemeral: true });
            }
            activeServices.set(user.id, Date.now());

            await member.roles.add(ROLE_EN_SERVICE).catch(console.error);
            await member.roles.remove(ROLE_HORS_SERVICE).catch(console.error);

            return interaction.reply({ content: '✅ Bonne prise de service !', ephemeral: true });
        }

        // ==========================================
        // 2. FIN DE SERVICE
        // ==========================================
        if (customId === 'service_out') {
            if (!activeServices.has(user.id)) {
                return interaction.reply({ content: '❌ Vous n\'êtes pas en service !', ephemeral: true });
            }

            const startTime = activeServices.get(user.id);
            const durationMs = Date.now() - startTime;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

            activeServices.delete(user.id);

            await member.roles.remove(ROLE_EN_SERVICE).catch(console.error);
            await member.roles.add(ROLE_HORS_SERVICE).catch(console.error);

            const skipRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('skip_bilan').setLabel('⏭️ Ignorer le fichier txt').setStyle(ButtonStyle.Secondary)
            );

            const bilanChannelId = '1520077010498748598';
            const bilanChannel = guild.channels.cache.get(bilanChannelId);

            weeklyLogs.push({ user: user.tag, id: user.id, duration: `${hours}h ${minutes}m`, date: new Date().toLocaleDateString('fr-FR') });

            if (bilanChannel) {
                await bilanChannel.send({
                    content: `<@${user.id}> Fin de service ! Temps: **${hours}h ${minutes}m**.\nVeuillez envoyer votre fichier \`.txt\` de bilan ici, ou cliquez sur Ignorer.`,
                    components: [skipRow]
                });
            }

            return interaction.reply({ content: '🔴 Fin de service validée. Rendez-vous dans le salon des bilans.', ephemeral: true });
        }

        // ==========================================
        // 3. IGNORER LE BILAN
        // ==========================================
        if (customId === 'skip_bilan') {
            const reportChannelId = '1520076866973597826';
            const reportChannel = guild.channels.cache.get(reportChannelId);
            
            if (reportChannel) {
                await reportChannel.send(`⚠️ L'employé <@${user.id}> a ignoré le dépôt de son fichier bilan journalier.`);
            }
            
            await interaction.message.delete().catch(() => {});
            return interaction.reply({ content: '✅ Bilan ignoré.', ephemeral: true }).catch(() => {});
        }

        // ==========================================
        // 4. CRÉATION DES TICKETS (RECRUTEMENT & QUESTION)
        // ==========================================
        if (customId === 'ticket_recrutement' || customId === 'ticket_question') {
            const ticketType = customId === 'ticket_recrutement' ? 'recrutement' : 'question';
            const staffRoleId = '1519791891611127919';

            const parentCategory = customId === 'ticket_recrutement' 
                ? '1520077067058679809'  
                : '1520077108301402192'; 

            try {
                await interaction.deferReply({ ephemeral: true });

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

                await channel.send({ content: `<@${user.id}> <@&${staffRoleId}>`, embeds: [embed] });
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
