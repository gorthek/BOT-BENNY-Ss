const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'reglement',
    async execute(message, args) {
        // Réservé aux administrateurs/HG
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        if (!args[0]) {
            return message.reply('❌ Précisez le règlement : `+reglement ig`, `+reglement discord` ou `+reglement employer`.');
        }

        const type = args[0].toLowerCase();
        message.delete(); // Supprime le message de commande pour garder le salon propre

        if (type === 'ig') {
            const embedIG = new EmbedBuilder()
                .setColor('#e74c3c') // Rouge
                .setTitle('🚗 RÈGLEMENT VILLE - BENNY\'S MOTOR WORKS')
                .setDescription('**À lire attentivement avant de venir au garage en RP.**\n\n> **1. Stationnement :** Garez-vous uniquement sur les places prévues.\n> **2. Comportement :** Tout manque de respect envers un mécano entraînera un refus de vente.\n> **3. Tarifs :** Nos prix sont fixes, aucune négociation n\'est acceptée.\n> **4. Sécurité :** L\'accès à l\'atelier de réparation est strictement interdit aux civils sans autorisation.')
                .setImage('https://cdn.discordapp.com/attachments/1520034067448463603/1520038366467592262/content.png?ex=6a3fbd8b&is=6a3e6c0b&hm=932c46a6d3436362d169248fbcc24959b14a295426c7e2c48366090865834618&') // Remplace par l'URL de ton image
                .setFooter({ text: 'La Direction du Benny\'s' });
            
            return message.channel.send({ embeds: [embedIG] });
        } 
        
        if (type === 'discord') {
            const embedDiscord = new EmbedBuilder()
                .setColor('#7289da') // Bleu Discord
                .setTitle('🌐 RÈGLEMENT DU DISCORD')
                .setDescription('**Règles de bonne conduite sur ce serveur.**\n\n> **1. Respect :** Aucune insulte, racisme ou discrimination (Ban immédiat).\n> **2. Spam / Pub :** Les liens externes et le spam sont interdits et gérés par le bot.\n> **3. Salons :** Utilisez les salons appropriés pour vos demandes (pas de ping inutile au staff).\n> **4. RP :** Ce discord est HRP, merci de séparer le jeu de la réalité.')
                .setImage('https://cdn.discordapp.com/attachments/1520034067448463603/1520038366467592262/content.png?ex=6a3fbd8b&is=6a3e6c0b&hm=932c46a6d3436362d169248fbcc24959b14a295426c7e2c48366090865834618&')
                .setFooter({ text: 'L\'Équipe Administrative' });

            return message.channel.send({ embeds: [embedDiscord] });
        } 
        
        if (type === 'employer') {
            // L'Embed employé combine les règles IG et Discord pour l'interne
            const embedEmployer = new EmbedBuilder()
                .setColor('#f1c40f') // Jaune
                .setTitle('🛠️ RÈGLEMENT INTERNE - EMPLOYÉS')
                .setDescription('**Règlement strict pour tous les membres de l\'entreprise.**')
                .addFields(
                    { name: '🟢 EN VILLE (IG)', value: '> - Port de la tenue obligatoire.\n> - Annonce radio à chaque prise de service.\n> - Réparation entre amis interdite (motif de renvoi).\n> - Facturation obligatoire pour chaque prestation.' },
                    { name: '💻 SUR DISCORD', value: '> - Utilisez `+presence` à chaque début et fin de service.\n> - Dépôt du bilan journalier (.txt) obligatoire après votre service.\n> - Respect absolu de la hiérarchie dans le salon #discussions-employés.' }
                )
                .setImage('https://cdn.discordapp.com/attachments/1520034067448463603/1520038366467592262/content.png?ex=6a3fbd8b&is=6a3e6c0b&hm=932c46a6d3436362d169248fbcc24959b14a295426c7e2c48366090865834618&')
                .setFooter({ text: 'Ressources Humaines - Benny\'s' });

            return message.channel.send({ embeds: [embedEmployer] });
        }

        message.channel.send('❌ Option invalide. Utilisez `ig`, `discord` ou `employer`.');
    }
};