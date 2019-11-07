import { Client, Message, RichEmbed } from 'discord.js';
import * as Discord from 'discord.js';
import { IConfig } from '../interfaces/config';
import { IEmbedContent } from '../interfaces/embedContent';

const config: IConfig = require('../../config.json');

/**
 * Function that clean the channel
 * This function call itslef while there is still message to delete
 * @param Bot -- The Bot variable
 * @param channel -- The channel that the bot need to clean
 * @param nbRemoved -- The incrementing number of deleted messages
 * @return TODO: TBD
 */
export async function clean(Bot: Discord.Client,
                            channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel,
                            nbRemoved: number = 0) {

    const messages = await channel.fetchMessages();
    if (messages.size > 0) {
        const message = messages.first();
        await message.delete();

        // special TSLint disable for receptivity
        // tslint:disable-next-line:no-parameter-reassignment
        nbRemoved++;
        return clean(Bot, channel, nbRemoved);
    }
    channel.send(`${nbRemoved} messages supprimées !`).then((message: Discord.Message) => {
        message.delete(2000).catch();
    });
}

/**
 * Function that generate the mongoDB connection string
 * This function take the config parameters, and creat a mongodb connection string depending on the configuration
 * @return string -- MongoDB connection string
 */
export function getMongoDbConnectionString() {
    let uri: string;

    if (process.env.GH_ACTIONS === 'true') { // If environement is GitHub actions, then use simple things
        uri = `mongodb://localhost:27017/${process.env.DB_NAME}`;
    } else { // Else use the application-properties file
        uri = 'mongodb://';

        if (config.db.username && config.db.password) { // If username AND password are set then add them to the string
            uri += `${config.db.username}:${config.db.password}@`;
        }

        uri += `${config.db.address}:${config.db.port}/${config.db.name}`;
    }
    return uri;
}

/**
 * This function allow to parse string to edit value inside
 *
 * @param message -- The message to parse
 * @param args -- The value to put in the message
 */
export function parseLangMessage(message: string, args: object) {
    let result = message;
    let match = result.match(/\$\$(\S*)\$\$/);
    while (match) {
        const char = result.slice(match.index+2).split('$$')[0];
        result = result.replace(`$$${char}$$`, args[char]);
        match = result.match(/\$\$(\S*)\$\$/);
    }
    return result;
}

/**
 * This function is to send message by the bot
 * @param message -- the string message that the bot need to send
 * @param where -- the channel or user that the bot need to send message to
 * @return Promise<Message | Message[]> | number -- A promise of a -1 on error
 */
export function sendMessageByBot(
    message: string,
    where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User
): Promise<Message | Message[]> | number {
    if (message.length > 0 && message) {
        return where.send(message);
    }
    return -1;
}

/**
 * This function send a message via the bot and delete the request message to keep the channel clean
 *
 * @param message -- The message to send
 * @param where -- On which channel does the bot need to send the message
 * @param messageToDelete -- The message that the bot need to delete after sending the message
 */
export async function sendMessageByBotAndDelete(
    message: string,
    where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User,
    messageToDelete: Message) {

    await sendMessageByBot(message, where);
    return messageToDelete.delete();
}

export async function generateEmbed(    Bot: Client,
                                        level: 'error' | 'info' | 'success' | 'warn',
                                        lang: IEmbedContent,
                                        authorID?: string): Promise<Partial<RichEmbed>> {
    let author = null;
    if (authorID) {
        author = await Bot.fetchUser(authorID);
    }
    return {
        author: {
            name: author ? author.username : Bot.user.username,
            icon_url: author ? author.icon_url : Bot.user.avatarURL
        },
        color: getEmbedColorByLevel(level),
        title: lang.title,
        description: lang.description,
        footer: {
            icon_url: Bot.user.avatarURL,
            text: Bot.user.username + ' | Designed by SOUQUET Thibault - 2018'
        }
    } as Partial<RichEmbed>;
}

function getEmbedColorByLevel(level: 'error' | 'info' | 'success' | 'warn'): number {
    switch (level) {
        case 'error': {
            return 16711680;
        }
        case 'info': {
            return 36295;
        }
        case 'success': {
            return 1744384;
        }
        case 'warn':
        default: {
            return 12619008;
        }
    }
}
