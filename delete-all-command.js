require('dotenv').config();
const { TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId } = process.env;

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
    // for guild-based commands
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);

    // for global commands
    rest.put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);

	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

