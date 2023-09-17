require('dotenv').config();
const { TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId } = process.env;

const fs = require('node:fs');
const path = require('node:path');
// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits , } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

const { codeBlock } = require('@discordjs/builders');

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()){
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
  
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }
  if (interaction.isModalSubmit()){
    if (interaction.customId === 'myModal') {
      const language= interaction.fields.getTextInputValue('languageInput');
      const code = interaction.fields.getTextInputValue('codeInput');
  
      const { output, highlight } = await executeCode(language, code);
  
      // Display the input and output
      // 하이라이트 source에 추가
      // let result = output;

      // if(highlight){
      //   result = highlight+'\n'+result;
      // }
      await interaction.reply(codeBlock(output));
  
    }
  }
});

const TIO = require('./tio/tio.js');

async function executeCode(search, code) {
  const tioUrl = 'https://tio.run/cgi-bin/run/api/';
  const languageMap = {
    'js':'javascript-v8',
    'py':'python3',
    'perl':'perl6',
    'java':'java-openjdk',
    'cpp':'ecpp-cpp',

    'python':'python3',
    'javascript':'javascript-v8',
    'node':'javascript-node',
  }
  const language = languageMap[search] || search;

  const payload = {
    lang: language,
    code,
    args: [],
    stdin: '',
    version: 'latest',
  };

  try {
    const response = await TIO.run(payload.code, 'stdin', payload.lang); //await axios.post(tioUrl, payload);

    return {
      highlight: language !== search && search,
      output: response[0],
      debug: response[1]
    }
  } catch (error) {
    return { error: 'Error executing code.' };
  }
}

client.login(token);