const dotenv = require('dotenv');
// Check for --dev option
if (process.argv.includes('--dev')) {
    dotenv.config({path: '.env.dev'});
} else {
    dotenv.config({path: '.env'});
}

const {token, clientId} = process.env;

const fs = require('node:fs');
const path = require('node:path');

// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const deployCommands = require('./helpers/deployCommands.js');

deployCommands(token, clientId);

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
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
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

const { EmbedBuilder, codeBlock } = require('@discordjs/builders');
const modalData = new Map();

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      await command.execute(interaction);
      return;
    }
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'myModal') {
        const {guild, user} = interaction;
        const language = interaction.fields.getTextInputValue('languageInput').trim().toLowerCase();
        const code = interaction.fields.getTextInputValue('codeInput');

        const { output, debuglog, highlight } = await executeCode(language, code);

        const nickname = guild.member?.displayName || user.displayName || user.username;

        // inside a command, event listener, etc.
        const resultEmbed = new EmbedBuilder()
          .setAuthor({ name: nickname, iconURL: user.avatarURL(), url: user.avatarURL() })
          .setTitle('language')
          .setDescription(languageMap[language] || language)
          .addFields(
            { name: 'source', value: codeBlock(highlight, code) },
            { name: 'output', value: codeBlock(output) },
            { name: 'stack trace', value: codeBlock('sh', debuglog) },
          )
          .setTimestamp()
          .setFooter({ text: client.user.displayName, iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [resultEmbed] });

        return;

        // Save the code and debuglog for this interaction using interactionId as the key
        modalData.set(interaction.id, { code, debuglog, highlight });

        setTimeout(() => {
          modalData.delete(interaction.id);
          console.log(`modalData ${interaction.id} was deleted.`);
        }, 24 * 60 * 60 * 1000);

        const source = new ButtonBuilder()
          .setCustomId(`source:${interaction.id}`)
          .setLabel('Source')
          .setStyle(ButtonStyle.Secondary);

        const debug = new ButtonBuilder()
          .setCustomId(`debug:${interaction.id}`)
          .setLabel('Debug')
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
          .addComponents(source, debug);

        await interaction.reply({
          content: codeBlock(output),
          components: [row],
        });

      }
      return;
    }
    if (interaction.isButton()) {
      const [buttonType, modalId] = interaction.customId.split(':');
      if (!modalData.get(modalId)) {
        await interaction.reply({ content: '공유 시간이 만료되었습니다.', ephemeral: true });
        return;
      }
      const { code, debuglog, highlight } = modalData.get(modalId);
      if (buttonType === 'source') {
        await interaction.reply({
          content: codeBlock(highlight, code),
          ephemeral: true
        });
        return;
      }
      if (buttonType === 'debug') {
        await interaction.reply({
          content: codeBlock(debuglog),
          ephemeral: true
        });
        return;
      }

      return;
    }
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while interaction.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while interaction.', ephemeral: true });
    }
  }
});

const TIO = require('./tio/tio.js');
const languageMap = {
  'js': 'javascript-v8',
  'ts': 'typescript',
  'py': 'python3',
  'perl': 'perl6',
  'java': 'java-openjdk',
  'cpp': 'ecpp-cpp',
  'c': 'c-clang',
  'python': 'python3',
  'javascript': 'javascript-v8',
  'node': 'javascript-node',
}

async function executeCode(search, code) {
  //const tioUrl = 'https://tio.run/cgi-bin/run/api/';

  let language = languageMap[search] || search;

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
      highlight: search == 'node' ? 'js' : (languageMap.hasOwnProperty(search) && search),
      output: response[0],
      debuglog: response[1]
    }
  } catch (error) {
    return { error: 'Error executing code.' };
  }
}

client.login(token);