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

        const { customId, user } = interaction;

        if (customId === 'service_in') {
            if (activeServices.has(user.id)) {
                return interaction.reply({ content: '❌ Vous êtes déjà en service !', ephemeral: true });
            }
            activeServices.set(user.id, Date.now());

            await interaction.member.roles.add(ROLE_EN_SERVICE).catch(console.error);
            await interaction.member.roles.remove(ROLE_HORS_SERVICE).catch(console.error);

            await interaction.reply({ content: '✅ Bonne prise de service !', ephemeral: true });
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

            await interaction.member.roles.remove(ROLE_EN_SERVICE).catch(console.error);
            await interaction.member.roles.add(ROLE_HORS_SERVICE).catch(console.error);

            const skipRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('skip_bilan').setLabel('⏭️ Ignorer le fichier txt').setStyle(ButtonStyle.Secondary)
            );

            const bilanChannelId = '1520077010498748598';
            const bilanChannel = interaction.guild.channels.cache.get(bilanChannelId);

            weeklyLogs.push({ user: user.tag, id: user.id, duration: `${hours}h ${minutes}m`, date: new Date().toLocaleDateString('fr-FR') });

            await bilanChannel.send({
                content: `<@${user.id}> Fin de service ! Temps: **${hours}h ${minutes}m**.\nVeuillez envoyer votre fichier \`.txt\` de bilan ici, ou cliquez sur Ignorer.`,
                components: [skipRow]
            });

            await interaction.reply({ content: '🔴 Fin de service validée. Rendez-vous dans le salon des bilans.', ephemeral: true });
        }

        if (customId === 'skip_bilan') {
            const reportChannelId = '1520076866973597826';
            const reportChannel = interaction.guild.channels.cache.get(reportChannelId);
            await reportChannel.send(`⚠️ L'employé <@${user.id}> a ignoré le dépôt de son fichier bilan journalier.`);
            await interaction.message.delete().catch(() => {}); // ← ajoute juste le .catch
            await interaction.reply({ content: '✅ Bilan ignoré.', ephemeral: true }).catch(() => {});
        }

        if (customId === 'ticket_recrutement' || customId === 'ticket_question') {
    const ticketType = customId === 'ticket_recrutement' ? 'recrutement' : 'question';
    const staffRoleId = '1519791891611127919';

    // 🟢 ON CHOISIT LA BONNE CATÉGORIE DYNAMIQUEMENT
    const parentCategory = customId === 'ticket_recrutement' 
        ? '1520077067058679809'  // ID Recrutement
        : '1520077108301402192'; // ID Question

    try {
        // On differe la réponse (UNE SEULE FOIS) pour éviter le timeout des 3 secondes
        await interaction.deferReply({ ephemeral: true });

        // On crée le salon en utilisant la variable "parentCategory"
        const channel = await interaction.guild.channels.create({
            name: `${ticketType}-${interaction.user.username}`, // Remplacement de user par interaction.user pour la sécurité
            type: ChannelType.GuildText,
            parent: parentCategory, // S'applique automatiquement ici
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
                {
                    id: staffRoleId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                }
            ],
        });

        // Message d'accueil à l'intérieur du ticket tout juste créé
        await channel.send(`👋 Bonjour <@${interaction.user.id}>, bienvenue dans votre ticket de **${ticketType}**.\nLe staff <@&${staffRoleId}> va s'occuper de vous d'ici quelques instants.`);

        // On confirme à l'utilisateur que son ticket est ouvert
        await interaction.editReply({ content: `✅ Votre ticket a été créé avec succès ici : <#${channel.id}>` });

    } catch (error) {
        console.error("Erreur lors de la création du ticket :", error);
        if (interaction.deferred) {
            await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création de votre ticket.' });
        }
    }
}

                const embed = new EmbedBuilder()
                    .setTitle(`Ticket de ${ticketType}`)
                    .setDescription(`Bienvenue <@${user.id}> !\n\nLe staff vous répondra dès que possible.\n\nUtilisez \`+ticket close\` pour fermer ce ticket.`)
                    .setColor('#0099ff')
                    .setTimestamp();

                await channel.send({ content: `<@${user.id}> <@&${staffRoleId}>`, embeds: [embed] });
                await interaction.editReply({ content: `✅ Votre ticket a été créé : <#${channel.id}>` });

            } catch (error) {
                console.error(error);
                if (error.code !== 10062) {
                    await interaction.editReply({ content: '❌ Erreur lors de la création du ticket.' }).catch(() => {});
                }
            }
        }
    }
};
