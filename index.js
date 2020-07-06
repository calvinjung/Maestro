const Discord = require("discord.js")
const ytdl = require("ytdl-core");

const client = new Discord.Client()

const queue = new Map();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity("YouTube", {type: "WATCHING"});
})

client.once("reconnecting", () => {
    console.log("Reconnecting!");
  });
  
client.once("disconnect", () => {
    console.log("Disconnect!");
});

var prefix = "="
  
client.on("message", async message => {

    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
  
    const serverQueue = queue.get(message.guild.id);
  
    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
    }});

    const novc = new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Join a voice channel first!')
        .setDescription('You need to be in a voice channel to play music.')
  
    async function execute(message, serverQueue) {
        const args = message.content.split(" ");
    
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(novc);
    
        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url
        };
  
        if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
    
        queue.set(message.guild.id, queueContruct);
    
        queueContruct.songs.push(song);
    
        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }

    } else {
        serverQueue.songs.push(song);
        const addedsong = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Song added!')
            .setDescription(`**${song.title}** has been added to the queue!`)
        return message.channel.send(addedsong);
    }}
  
    function skip(message, serverQueue) {
        if (!message.member.voice.channel) {
            const novcstop = new Discord.MessageEmbed()
                .setColor('#00ff00')
                .setTitle('Join a voice channel first!')
                .setDescription("You have to be in a voice channel to stop the music.")
            return message.channel.send(novcstop);
        }
        if (!serverQueue) {
            const noaddedsong = new Discord.MessageEmbed()
                .setColor('#00ff00')
                .setTitle('No more songs to play!')
                .setDescription("There is no song that I could skip.")
            message.channel.send(noaddedsong);
            serverQueue.connection.dispatcher.end();
            return
        }
    }
    
    function stop(message, serverQueue) {
        if (!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to stop the music!");
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
  
    function play(guild, song) {
        const serverQueue = queue.get(guild.id);
        if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
  
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);

}

client.login("NzI5NDg0OTAzNDc2ODg3Njcy.XwJofA.cBtX9WIzfN05MZF3rP44ZYELaRE")