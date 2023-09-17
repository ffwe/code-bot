const { SlashCommandBuilder, } = require('@discordjs/builders');
const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('code')
    .setDescription('코드 입력창을 호출합니다.'),
  async execute (interaction) {
    const modal = new ModalBuilder()
    .setCustomId('myModal')
    .setTitle('코드 입력창');

    // Create the text input components
		const languageInput = new TextInputBuilder()
    .setCustomId('languageInput')
      // The label is the prompt the user sees for this input
    .setLabel("언어 (ruby, py, perl, java, js, node, cpp, php)")
      // Short means only a single line of text
    .setStyle(TextInputStyle.Short);

    const codeInput = new TextInputBuilder()
      .setCustomId('codeInput')
      .setLabel("코드 (소스 공유는 24시간 뒤 만료됩니다.)")
        // Paragraph means multiple lines of text.
      .setStyle(TextInputStyle.Paragraph);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(languageInput);
    const secondActionRow = new ActionRowBuilder().addComponents(codeInput);

    // Add inputs to the modal
    modal.addComponents(firstActionRow, secondActionRow);

    // Show the modal to the user
    await interaction.showModal(modal);
  }
};