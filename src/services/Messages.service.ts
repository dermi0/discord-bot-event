import {
  MessageEmbed, TextChannel, DMChannel, User, NewsChannel, Message,
} from 'discord.js';
import { EmbedTextInterface, I18nInterface } from '@/interfaces/i18n.interface';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';
import EmbedOptionsInterface from '@/interfaces/embed-options.interface';

export class MessagesServiceClass {
  private GLOBALS: GlobalsServiceClass;

  constructor() {
    this.GLOBALS = GlobalsService.getInstance();
  }

  /**
   * This function is to send message by the bot
   *
   * @param message -- the string message that the bot need to send
   * @param where -- the channel or user that the bot need to send message to
   */
  public static async sendMessageByBot(
    message: string | MessageEmbed,
    where: TextChannel | DMChannel | NewsChannel | User,
  ): Promise<Message> {
    let result;
    if (typeof message === 'string') {
      result = await where.send(message);
    } else {
      result = await where.send({ embed: message });
    }
    return result;
  }

  /**
   * This function return the discord embed color code from a alert level
   *
   * @param level -- The level of alert
   * @private
   */
  private static getEmbedColorByLevel(level: 'error' | 'info' | 'success' | 'warn'): number {
    if (level === 'error') {
      return 16711680;
    }
    if (level === 'info') {
      return 36295;
    }
    if (level === 'success') {
      return 1744384;
    }
    return 12619008;
  }

  /**
   * This function return the discord embed thumbnail url from the alert level
   *
   * @param level -- The level of the alert
   * @private
   */
  private static getEmbedThumbnailByLevel(level: 'error' | 'info' | 'success' | 'warn'): string {
    if (level === 'error') {
      return 'https://api.svalinn.fr/uploads/error_acfe8a5a01.png';
    }
    if (level === 'info') {
      return 'https://api.svalinn.fr/uploads/info_c2aa23440d.png';
    }
    if (level === 'success') {
      return 'https://api.svalinn.fr/uploads/success_86555f3264.png';
    }
    return 'https://api.svalinn.fr/uploads/warning_1c37e7b470.png';
  }

  /**
   * This function generate an embed to the bot to display pretty messages
   */
  public generateEmbed(
    i18n: I18nInterface,
    content: EmbedTextInterface,
    author: User,
    level: 'error' | 'info' | 'success' | 'warn',
    options?: EmbedOptionsInterface,
  ): MessageEmbed {
    const finalOptions = MessagesServiceClass.parseOptions(options);
    const { title } = content;
    let desc = content.description;

    // Parse message if needed
    if (finalOptions.langMessageArgs) {
      desc = MessagesServiceClass.parseLangMessage(desc, finalOptions.langMessageArgs);
    }

    const embed = {
      title,
      description: desc,
      footer: {
        iconURL: 'https://api.svalinn.fr/uploads/STSG_logo_c76f1420c7.png',
        text: this.GLOBALS.DBE.user.username + i18n.embed.credits,
      },
      author: {
        name: author.username,
        iconURL: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=2048`,
      },
      color: MessagesServiceClass.getEmbedColorByLevel(level),
    } as MessageEmbed;
    if (finalOptions.thumbnail) {
      embed.thumbnail = {
        url: MessagesServiceClass.getEmbedThumbnailByLevel(finalOptions.thumbnail),
      };
    }
    if (finalOptions.image) {
      embed.image = { url: finalOptions.image };
    }
    return embed;
  }

  /**
   * Function to parse the guild configs and find if it is registered
   *
   * @param message -- The message to test
   */
  public getLangFromMessage(message: Message): string {
    let i18n = null;
    const keys = Array.from(this.GLOBALS.GUILD_CONFIGS.keys());
    for (let i = 0; i < keys.length; i += 1) {
      const guildConfig = this.GLOBALS.GUILD_CONFIGS.get(keys[i]);
      if (guildConfig.guild_id === message.guild.id
        && message.channel.id === guildConfig.channel_id
      ) {
        i18n = guildConfig.i18n;
      }
    }
    return i18n;
  }

  /**
   * This function allow to parse string to edit value inside
   *
   * @param message -- The message to parse
   * @param args -- The value to put in the message
   */
  public static parseLangMessage(message: string, args: object): string {
    let result = message;
    let match = result.match(/\$\$(\S*)\$\$/);
    while (match) {
      const char = result.slice(match.index + 2).split('$$')[0];
      result = result.replace(`$$${char}$$`, args[char]);
      match = result.match(/\$\$(\S*)\$\$/);
    }
    return result;
  }

  /**
   * Function to generate an event embed
   *
   * @param i18n -- The lang of the message
   * @param message -- The message itself
   * @param title -- Title of the message
   * @param description -- Description of the message
   * @param day -- The day of the event
   * @param time -- The time of the event
   * @param participants -- The participants of the event
   * @param image -- The image if there is one
   * @private
   */
  public generateEventEmbed(
    i18n: string,
    message: Message,
    title: string,
    description: string,
    day: string,
    time: string,
    participants: string[],
    image?: string,
  ) {
    // Data of the parse Lang message to create the beautiful event message
    const parseLangMessageArgs = {
      description,
      time,
      day,
      participants: '',
    };
    // Display a no participants if there is none
    if (participants.length === 0) {
      parseLangMessageArgs.participants = this.GLOBALS.I18N.get(i18n).embed.event.noPeople;
    } else {
      // If there is participants then generate appropriate text
      let participantsText = '';
      for (let i = 0; i < participants.length; i += 1) {
        participantsText += `\n - <@!${participants[i]}>`;
      }
      parseLangMessageArgs.participants = participantsText;
    }

    // Generate the content
    const embedContent = {
      title,
      description: this.GLOBALS.I18N.get(i18n).embed.event.description,
    };

    // Generate the embed
    return this.generateEmbed(this.GLOBALS.I18N.get(i18n), embedContent, message.author, 'info', { image, thumbnail: 'info', langMessageArgs: parseLangMessageArgs });
  }

  /**
   * Function to parse the object and return a always valid object
   *
   * @param options -- The options to parse
   * @private
   */
  private static parseOptions(options?: EmbedOptionsInterface): EmbedOptionsInterface {
    const finalOptions: EmbedOptionsInterface = {
      image: undefined,
      langMessageArgs: undefined,
      thumbnail: undefined,
    };
    if (options) {
      if (options.image) {
        finalOptions.image = options.image;
      }
      if (options.thumbnail) {
        finalOptions.thumbnail = options.thumbnail;
      }
      if (options.langMessageArgs) {
        finalOptions.langMessageArgs = options.langMessageArgs;
      }
    }
    return finalOptions;
  }
}
export const MessagesService = new MessagesServiceClass();
