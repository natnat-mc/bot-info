# Les modules

## Liste des modules
* [`autoedt.js`](modules/autoedt.md)
	* affiche l'emploi du temps à intervalles réguliers
	* n'expose aucune commande
	* dépendances API
		* [`cron.js`](api/cron.md)
		* [`dates.js`](api/dates.md)
	* dépendances modules
		* [`edt.js`](modules/edt.md)
* [`bf.js`](modules/bf.md)
	* execute des programmes en [`brainfuck`](https://en.wikipedia.org/wiki/Brainfuck)
	* expose la commande [`brainfuck`](commands/brainfuck.md)
	* aucune dépendance API
	* aucune dépendance modules
* [`edt.js`](modules/edt.md)
	* répond aux requêtes de lecture d'emploi du temps des utilisateurs et met en forme
	* expose la commande [`edt`](commands/edt.md)
	* dépendances API
		* [`dates.js`](api/dates.md)
    * aucune dépendance modules
* [`help.js`](modules/help.md)
	* affiche l'aide aux utilisateurs
	* expose la commande [`help`](commands/help.md)
	* aucune dépendance API
	* aucune dépendance modules
* [`kfet.js`](modules/kfet.md)
	* parse [le site de la KFet](https://kfet.bdeinfo.org) et expose des handlers pour le reste du bot
	* n'expose aucune commande
	* dépendances API
		* [`cron.js`](api/cron.md)
    * aucune dépendance modules
* [`kfetorder.js`](modules/kfetorder.md)
	* répond aux requêtes de lecture des commandes KFet et permet le mode passif
	* expose la commande [`kfet`](commands/kfet.md)
	* dépendances API
		* [`cron.js`](api/cron.md)
    * dépendances modules
	    * [`kfet.js`](modules/kfet.md)
* [`modules.js`](modules/modules.md)
	* liste les modules chargés ainsi que leur rôle, description et date de chargement
	* expose la commande [`modules`](commands/modules.md)
	* dépendances API
		* [`dates.js`](api/dates.md)
* [`reload.js`](modules/reload.md)
	* recharge les modules sur demande; ne peut être utilisé que par un administrateur du bot
	* expose la commande [`reload`](commands/reload.md)
	* aucune dépendance API
	* aucune dépendance modules
* [`reminder.js`](modules/reminder.md)
	* gère les rappels des utilisateurs
	* expose la commande [`remind`](commands/remind.md)
	* dépendances API
		* [`dates.js`](api/dates.md)
		* [`storage.js`](api/storage.md)
		* [`cron.js`](api/cron.md)
		* [`discord.js`](api/discord.md)
    * aucune dépendance modules
* [`report.js`](modules/report.md)
	* permet aux utilisateurs de rapporter aux administrateurs du serveur les abus
	* expose la commande [`report`](commands/report.md)
	* dépendances API
		* [`discord.js`](api/discord.md)
		* [`dates.js`](api/dates.md)
    * aucune dépendances modules
* [`room.js`](modules/room.md)
	* affiche l'état d'occupation des salles informatiques
	* expose la commande [`room`](commands/room.md)
	* dépendances API
		* [`calendar.js`](api/calendar.md)
		* [`dates.js`](api/dates.md)
    * aucune dépendance modules
* [`usage.js`](modules/usage.md)
	* affiche l'aide d'utilisation des commandes
	* expose la commande [`usage`](commands/usage.md)
	* aucune dépendance API
	* aucune dépendance modules
