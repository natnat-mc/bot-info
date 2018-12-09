# Bot info
Le bot Discord de la promo 2018-2019 de l'IUT Lyon 1, développé par Nathan Décher / Codinget\#2749

## Fonctionnement général du bot
Le bot est intégralement écrit en JavaScript à l'aide de [Discord.js](https://github.com/discordjs/discord.js/). Il dépend seulement de `discord.js`, `jsdom` et `request` dans sa version de base, mais les dépendances sont sujettes à changement.

Le bot est centré autour d'[API](apis.md)s et de [modules](modules.md).

Les [API](apis.md)s ont pour rôle de fournir des fonctionnalités essentielles aux modules, comme la gestion de calendriers `ICalendar`, de données persistantes, d'execution à horaires fixes, de configuration...

Les [modules](modules.md) ont pour rôle de remplir des tâches plus spécifiques, et principalement d'intéragir avec l'utilisateur:
* publier les emplois du temps à intervalle régulier
* gérer les rappels
* gérer les commandes à la KFet
* executer des programmes en `brainfuck`
* trouver des salles informatiques libres
