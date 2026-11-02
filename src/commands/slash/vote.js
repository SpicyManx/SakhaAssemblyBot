const Discord = require("discord.js");
const fs = require('fs');
const votedPath = './SakhaInfo/voted.json'
const partiesPath = './SakhaInfo/parties.json'

module.exports = {
    cooldown: 5,
    data: new Discord.SlashCommandBuilder()
    .setName("vote")
    .setDescription("vote in current elections")
    .setContexts(Discord.InteractionContextType.Guild)
    .addStringOption( (option) => 
        option
            .setName('party')
            .setDescription('select the party you wish to vote')
            .setRequired(true)
            .setAutocomplete(true)
    ),
    async execute(client, interaction) {
        if(!interaction.member.toJSON().roles.includes("1494640457022705704")){
            await interaction.reply({ content:"You cannot vote as non-citizen", flags: Discord.MessageFlags.Ephemeral});
            return;
        }

        const parsed = JSON.parse(fs.readFileSync(votedPath, 'utf8'));

        if(!parsed.voting.on){
            await interaction.reply({ content: "Currently no general election is taking place.", flags: Discord.MessageFlags.Ephemeral});
            return;
        }

        if(Date.now() > parsed.voting.enddate){
            await interaction.reply({ content: "The time for voting has expired, wait for elections results.", flags: Discord.MessageFlags.Ephemeral});
            return;
        }

        if(parsed.list.includes(interaction.user.id)) {
            await interaction.reply({ content: "You already voted this term.", flags: Discord.MessageFlags.Ephemeral});
            return;
        }

        const parsedParties = JSON.parse(fs.readFileSync(partiesPath, 'utf8'));
        let index = -1;
        for(let i=0; i < parsedParties.list.length && index == -1; i++){    
            if(parsedParties.list[i].name==interaction.options.getString("party")) index = i;
        }

        if(index == -1) {
            await interaction.reply({ content: "Error, invalid party.", flags: Discord.MessageFlags.Ephemeral});
            return;
        }

        parsedParties.list[index].votes++;
        parsedParties.total++;
        
        
        parsed.list.push(interaction.user.id)
        fs.writeFileSync(partiesPath, JSON.stringify(parsedParties));
        fs.writeFileSync(votedPath, JSON.stringify(parsed));
        await interaction.reply({ content: "You voted for "+interaction.options.getString("party"), flags: Discord.MessageFlags.Ephemeral});
    },
    async autocomplete(interaction) {
        if(!interaction.member.toJSON().roles.includes("1494640457022705704")){
            return;
        }

		const focusedValue = interaction.options.getFocused();
        const choices = [];
        const parsedParties = JSON.parse(fs.readFileSync(partiesPath, 'utf8'));
        for(let i=0; i < parsedParties.list.length; i++){
            choices.push(parsedParties.list[i].name);
        }
		const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
		await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	},
    
}