const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🛠️ PANEL D\'AIDE - BENNY\'S BOT')
            .setDescription('Voici la liste de toutes les commandes disponibles avec le préfixe `+`.')
            .addFields(
                { name: '🎫 Tickets', value: '`+ticket setup` : Crée le panel de tickets.\n`+ticket add @user` : Ajoute un membre.\n`+ticket remove @user` : Retire un membre.\n`+ticket rename <nom>` : Renomme le ticket.\n`+ticket close` : Ferme le ticket.', inline: false },
                { name: '👑 Hiérarchie & Présence', value: '`+hierarchie` : Affiche l\'organigramme (auto-actualisé).\n`+presence` : Affiche le panel de prise de service.', inline: false },
                { name: '📜 Règlements', value: '`+reglement ig` : Règlement en ville.\n`+reglement discord` : Règlement du serveur.\n`+reglement employer` : Règlement interne.', inline: false },
                { name: '🛡️ Modération & Utilitaire', value: '`+clear <nombre>` : Supprime des messages.\n`+nuke` : Réinitialise un salon à zéro.\n`+backup create` : Fait une sauvegarde complète du serveur.\n`+backup load <ID>` : Restaure une sauvegarde.', inline: false }
            )
            .setFooter({ text: 'Bot développé pour le Benny\'s Motor Works' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};