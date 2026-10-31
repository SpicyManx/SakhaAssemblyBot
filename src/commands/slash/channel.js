const Discord = require("discord.js");
const fs = require('fs');
const channelsPath = './SakhaInfo/channels.json'


module.exports = {
    cooldown: 5,
    data: new Discord.SlashCommandBuilder()
    .setName("channel")
    .setDescription("Change the channel for each type of announcement")
    .setContexts(Discord.InteractionContextType.Guild)
    .addSubcommand((subcommand) =>
		subcommand
			.setName('elections')
			.setDescription('Start elections')
            .addChannelOption((option) => 
                option
                .setName('channel')
                .setDescription('select the channels where elections will take place')
                .setRequired(true)
        )
	)
    .addSubcommand((subcommand) =>
		subcommand
			.setName('motions')
			.setDescription('Start elections')
            .addChannelOption((option) => 
                option
                .setName('channel')
                .setDescription('select the channels where motions will take place')
                .setRequired(true)
        )
	)
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator),
    async execute(client, interaction) {
        const channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
        const id = interaction.options.getChannel("channel").id;

        if(interaction.options.getSubcommand() == "elections"){
            channels.elections = id
        } else {
            channels.motions = id
        }

        fs.writeFileSync(channelsPath, JSON.stringify(channels));
        await interaction.reply({ content: "The "+interaction.options.getSubcommand()+" has been updated successfully", flags: Discord.MessageFlags.Ephemeral});
    },
};
