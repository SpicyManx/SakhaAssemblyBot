const Discord = require("discord.js");
const fs = require('fs');
const votedPath = './SakhaInfo/voted.json'
const partiesPath = './SakhaInfo/parties.json'
const channelsPath = './SakhaInfo/channels.json'
const electionLengthDays = 2;


module.exports = {
    cooldown: 5,
    data: new Discord.SlashCommandBuilder()
    .setName("election")
    .setDescription("Begin or end elections")
    .setContexts(Discord.InteractionContextType.Guild)
    .addSubcommand((subcommand) =>
		subcommand
			.setName('start')
			.setDescription('Start elections')
	)
    .addSubcommand((subcommand) =>
		subcommand
			.setName('end')
			.setDescription('End elections and get the results')
	)
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator),
    async execute(client, interaction) {
        const voted = JSON.parse(fs.readFileSync(votedPath, 'utf8'));
        const parties = JSON.parse(fs.readFileSync(partiesPath, 'utf8'));
        const channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));

        const file = new Discord.AttachmentBuilder('./SakhaInfo/botphoto.png');
        const Embed = new Discord.EmbedBuilder()
        .setFooter({ text: "Sakha Assembly Official bot", iconURL: 'attachment://botphoto.png' });


        




        if(interaction.options.getSubcommand() == "start"){
            let string = "## Parties avaiable to vote in the election:"
            if(voted.voting.on) {
                await interaction.reply({ content: "The election has already started. End them to start a new one.", flags: Discord.MessageFlags.Ephemeral});
                return;
            }

            parties.total = 0;
            for(let i=0; i < parties.list.length; i++){
                let party = parties.list[i];
                
                party.votes = 0;
                string += "\n"+party.name+"\n- "+party.leader+"\n- "+party.president
            }


            voted.voting.on=true
            voted.voting.enddate=Date.now()+86400000*electionLengthDays

            string += "\n### Voting ends in <t:"+Math.round(voted.voting.enddate/1000)+":R>"

            Embed.setAuthor({ name: interaction.user.globalName + " has started the election", iconURL: interaction.member.displayAvatarURL()}) 
            .setDescription(string)
            .setColor(0x008000)
        } else {
            if(!voted.voting.on){
                await interaction.reply({ content: "There's currently no election taking place.", flags: Discord.MessageFlags.Ephemeral});
                return;
            } 
            if(Date.now() < voted.voting.enddate) {
                await interaction.reply({ content: "The election is still taking place", flags: Discord.MessageFlags.Ephemeral});
                return;
            }
            
            let winner = null;
            let string = '## Results of the election:\nTotal votes: '+parties.total+"\n"
            let percent = null;
            let undecided = false;
            let party;
            

            for(let i=0; i < parties.list.length; i++){
                party = parties.list[i];
                percent = (party.votes/parties.total)*100;
                
                if(percent >= 50 && percent != Infinity){
                    if(winner == null){
                        winner = party.name;
                    } else {
                        undecided = true;
                        winner = winner+" and "+party.name;
                    }
                } else {
                    percent = 0;
                }

                string += party.name+": "+percent.toFixed(2)+"%\n"+"- "+party.leader+"\n- "+party.president+"\n"
            }
            
            if(winner == null){
                string += "### **No party has been elected**"
            } else if (undecided) {
                string += "### The <@&1496934127683895346> has to choose between **"+winner+"** in order for them to be elected."
            } else {
                string += "### **"+winner+"** has been elected!"
            }

            Embed.setAuthor({ name: interaction.user.globalName + " has ended the election", iconURL: interaction.member.displayAvatarURL()})
            .setDescription(string)
            .setColor(0xff0000)
            voted.voting.on=false
            voted.list=[]
        }








        fs.writeFileSync(partiesPath, JSON.stringify(parties));
        fs.writeFileSync(votedPath, JSON.stringify(voted));

        
        await interaction.reply({ content: "Action completed with sucess", flags: Discord.MessageFlags.Ephemeral});
        const channel = await client.channels.fetch(channels.elections);
        channel.send({ content: Discord.userMention(interaction.user.id)+" "+Discord.roleMention("1494640457022705704"), embeds: [Embed], files: [file]});
    },
};
