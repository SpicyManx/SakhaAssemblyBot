const Discord = require("discord.js");

module.exports = {
    cooldown: 5,
    data: new Discord.SlashCommandBuilder()
    .setName("motion")
    .setDescription("Says smth idk")
    .setContexts(Discord.InteractionContextType.Guild)
    .addAttachmentOption((option) => option.setName('addfile').setDescription('The input to echo back').setRequired(true))
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator),
    async execute(client, interaction) {
        const file = new Discord.AttachmentBuilder('./SakhaInfo/botphoto.png');
        const exampleEmbed = new Discord.EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Some title')
        .setURL('https://discord.js.org/')
        .setAuthor({ name: 'Some name', iconURL: 'attachment://botphoto.png', url: 'https://discord.js.org' })
        .setDescription('Some description here')
        .setThumbnail('attachment://botphoto.png')
        .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        .setImage('attachment://botphoto.png')
        .setTimestamp()
        .setFooter({ text: "Sakha Assembly Official bot", iconURL: 'attachment://botphoto.png' });


        await interaction.reply({ content: "This command is not yet finished", flags: Discord.MessageFlags.Ephemeral});
    },
};
