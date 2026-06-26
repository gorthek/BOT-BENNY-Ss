const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'hierarchie',
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const embedInitial = await this.genererEmbed(message.guild);
        const hierarchyMessage = await message.channel.send({ embeds: [embedInitial] });
        message.delete();

        // Actualisation toutes les 2 minutes (120 000 ms)
        setInterval(async () => {
            try {
                const nouvelEmbed = await this.genererEmbed(message.guild);
                await hierarchyMessage.edit({ embeds: [nouvelEmbed] });
            } catch (error) {
                console.error("Erreur actualisation hiérarchie:", error);
            }
        }, 120000);
    },

    async genererEmbed(guild) {
        await guild.members.fetch();

        const roles = {
            patron: '1519792201155215571',
            copatron: '1519792269065191575',
            secretaire: '1519792337784537118',
            expert: '1519792572267233290',
            mecano: '1519792760993873960',
            stagiaire: '1519793223088869436',
            employer: '1519820247866020004'
        };

        const getMembers = (roleId) => {
            const role = guild.roles.cache.get(roleId);
            if (!role) return 'Aucun';
            const members = role.members.map(m => `> <@${m.user.id}>`).join('\n');
            return members || 'Aucun';
        };

        const employerCount = guild.roles.cache.get(roles.employer)?.members.size || 0;

        return new EmbedBuilder()
            .setColor('#e67e22')
            .setTitle('👑 ORGANIGRAMME BENNY\'S')
            .addFields(
                { name: '👑 | Patron', value: getMembers(roles.patron), inline: false },
                { name: '⚒️ | Co-Patron', value: getMembers(roles.copatron), inline: false },
                { name: '📜 | Secrétaire', value: getMembers(roles.secretaire), inline: false },
                { name: '🛠️ | Mécano Expert', value: getMembers(roles.expert), inline: false },
                { name: '🔧 | Mécano', value: getMembers(roles.mecano), inline: false },
                { name: '🔧 | Mécano Stagiaire', value: getMembers(roles.stagiaire), inline: false }
            )
           // .setImage('URL_BANNIERE_HIERARCHIE')
            .setTimestamp()
            .setFooter({ text: `Total Employés (Role Employer) : ${employerCount}` });
    }
};
