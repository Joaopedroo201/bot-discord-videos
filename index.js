import { config } from 'dotenv'
import { Client, GatewayIntentBits } from 'discord.js'
import { google } from 'googleapis'
import { schedule } from 'node-cron'

config();

const discordClient = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ]
})

const youtubeClient = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
})

let latestVideoId = ''

// Inicialização do bot
discordClient.login(process.env.DISCORD_TOKEN)

discordClient.on('ready', () => {
    console.log(`Bot Online, logado como: ${discordClient.user.tag}`)
    checkNewVideos()
    schedule("* * 0 * * *", checkNewVideos)
})

// Função que busca o video
async function checkNewVideos(){
    try {
        const response = await youtubeClient.search.list({
            channelId: 'id do seu canal',
            order: 'date',
            part: 'snippet',
            type: 'video',
            maxResults: 1
        }).then(res => res)
        const latestVideo = response.data.items[0]
        if(latestVideo?.id?.videoId != latestVideoId){
            latestVideoId = latestVideo?.id?.videoId;
            const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
            const message = "Confira o último video do canal ! ";
            const channel = discordClient.channels.cache.get('id do chat');
            channel.send(message + videoUrl)
        }
    } catch(error) {
        console.log("Erro ao buscar último video do canal")
        console.log(error)
    }
}