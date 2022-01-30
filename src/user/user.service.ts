import { Prefix } from './models/prefix.model';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guild, Users } from './models/user.model';
import * as axios from 'axios';
import { Chatbot } from './models/chatbot.model';
import { LevellingEnabled } from './models/levellingenabled.model';
import { Count } from './models/count.model';
import { AxiosResponse } from 'axios';
const Axios = axios.default;
type method = 'NEW' | 'DELETE' | 'EDIT';
type overwrites = {
  id: string;
  type: number;
  allow: string;
  deny: string;
};
type channel = {
  id: string;
  type: number;
  name: string;
  position: number;
  parent_id: number | null;
  guild_id: string;
  permission_overwrites: Array<overwrites>;
  nsfw: boolean;
};
const guildCache: Guild[] = [];
@Injectable()
export class UserService {
  constructor(
    @InjectModel('users') private readonly userModel: Model<Users>,
    @InjectModel('chatBot') private readonly chatBotModel: Model<Chatbot>,
    @InjectModel('guild-prefix') private readonly prefixModel: Model<Prefix>,
    @InjectModel('levellingEnabled')
    private readonly levellingEnabledModel: Model<LevellingEnabled>,
    @InjectModel('countSchema') private readonly countModel: Model<Count>,
  ) {}
  async getUserById(id: string) {
    const user = await this.userModel.findOne({ discordId: id });
    return user;
  }
  async getUserByIdAndUpdateGuilds(id: string, guilds: Array<Guild>) {
    const user = await this.userModel.findOneAndUpdate(
      { discordId: id },
      { guilds },
    );
    return user;
  }
  async addUserToDB(user: Users) {
    const newUser = await this.userModel.create(user);
    const result = newUser.save();
    return result;
  }
  async getBotGuilds() {
    setInterval(async () => {
      guildCache.length = 0;
    }, 1000 * 60 * 30);
    if (guildCache.length !== 0) {
      return guildCache;
    } else {
      const response = await Axios.get(
        'http://discord.com/api/v9/users/@me/guilds',
        {
          headers: {
            Authorization: `Bot ${process.env.BOTTOKEN}`,
          },
        },
      );
      guildCache.push(...response.data);

      return response.data;
    }
  }
  async getChannels(guildId): Promise<channel[]> {
    const response = await Axios.get(
      `https://discord.com/api/v9/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${process.env.BOTTOKEN}`,
        },
      },
    );
    return response.data;
  }
  async getGuild(guildid) {
    let err = false;
    const response = await Axios.get(
      `https://discord.com/api/v9/guilds/${guildid}`,
      {
        headers: {
          Authorization: `Bot ${process.env.BOTTOKEN}`,
        },
      },
    ).catch(() => {
      err = true;
    });
    return err ? 401 : response ? response.data : null;
  }
  async getMutualGuilds(userGuilds: Array<Guild>, botGuilds: Array<Guild>) {
    return userGuilds.filter((guilds) =>
      botGuilds.find(
        (botGuild) =>
          botGuild.id == guilds.id && (guilds.permissions & 0x20) == 0x20,
      ),
    );
  }
  async getTextChannels(channels) {
    console.log(channels);
    const text = channels.filter((c) => c.type == 0 || c.type == 5);
    return text;
  }
  async getGuildIcon(guildObj: Guild): Promise<string | number> {
    if (typeof guildObj === 'number') {
      return guildObj == 401 ? 401 : 500;
    }
    const response = `https://cdn.discordapp.com/icons/${guildObj.id}/${guildObj.icon}`;
    return response;
  }
  async checkIfUserIsInGuild(user: Users, guildID: string) {
    const botg = await this.getBotGuilds();
    const res = await this.getMutualGuilds(user.guilds, botg);
    const f = res.find((g) => g.id == guildID);
    return f;
  }
  async accessChatBotDB(method: method, data?: Chatbot) {
    if (
      method === 'DELETE' &&
      data.guildID &&
      data.channelID === 'NOT_REQUIRED'
    )
      return this.chatBotModel.deleteOne({ guildID: data.guildID });
    if (method === 'NEW' && data.guildID && data.channelID) {
      const alrD = await this.chatBotModel.findOne({ guildID: data.guildID });
      if (alrD) return HttpStatus.BAD_REQUEST;
      const d = await this.chatBotModel.create({
        guildID: data.guildID,
        channelID: data.channelID,
      });
      return d.save();
    }
    if (method === 'EDIT' && data.guildID && data.channelID) {
      const alrD = await this.chatBotModel.findOne({ guildID: data.guildID });
      if (!alrD) return HttpStatus.BAD_REQUEST;
      return await this.chatBotModel.updateOne(
        { guildID: data.guildID },
        { channelID: data.channelID },
      );
    } else return HttpStatus.BAD_REQUEST;
  }

  async accessPrefixDB(method: method, data?: Prefix) {
    if (
      method === 'DELETE' &&
      data.guildID &&
      (data.prefix === 'NOT_REQUIRED' || !data.prefix)
    )
      return this.prefixModel.deleteOne({ guildID: data.guildID });
    if (method === 'NEW' && data.guildID && data.prefix) {
      const alrD = await this.prefixModel.findOne({ guildID: data.guildID });
      if (alrD) return HttpStatus.BAD_REQUEST;
      const d = await this.prefixModel.create({
        guildID: data.guildID,
        prefix: data.prefix,
      });
      return d.save();
    }
    if (method === 'EDIT' && data.guildID && data.prefix) {
      const alrD = await this.prefixModel.findOne({ guildID: data.guildID });
      if (!alrD) return HttpStatus.BAD_REQUEST;
      return await this.prefixModel.updateOne(
        { guildID: data.guildID },
        { prefix: data.prefix },
      );
    } else return HttpStatus.BAD_REQUEST;
  }
  async accesLevellingEnabledDB(method: method, data?: LevellingEnabled) {
    if (method === 'DELETE' && data.guildID)
      return this.levellingEnabledModel.deleteOne({ guildID: data.guildID });
    if (method === 'NEW' && data.guildID && data.enabled) {
      const alrD = await this.levellingEnabledModel.findOne({
        guildID: data.guildID,
      });
      if (alrD) return HttpStatus.BAD_REQUEST;
      const d = await this.levellingEnabledModel.create({
        guildID: data.guildID,
        enabled: data.enabled,
      });
      return d.save();
    }
    if (method === 'EDIT' && data.guildID && data.enabled) {
      const alrD = await this.levellingEnabledModel.findOne({
        guildID: data.guildID,
      });
      if (!alrD) return HttpStatus.BAD_REQUEST;
      return await this.levellingEnabledModel.updateOne(
        { guildID: data.guildID },
        { enabled: data.enabled },
      );
    } else return HttpStatus.BAD_REQUEST;
  }
  async accesCountSchemaDB(method: method, data?: Count) {
    if (
      method === 'DELETE' &&
      data._id &&
      (data.voiceChannelID === 'NOT_REQUIRED' || !data.voiceChannelID)
    )
      return this.prefixModel.deleteOne({ _id: data._id });
    if (method === 'NEW' && data._id && data.voiceChannelID) {
      const alrD = await this.prefixModel.findOne({
        _id: data._id,
      });
      if (alrD) return HttpStatus.BAD_REQUEST;
      const d = await this.prefixModel.create({
        _id: data._id,
        voiceChannelID: data.voiceChannelID,
      });
      return d.save();
    }
    if (method === 'EDIT' && data._id && data.voiceChannelID) {
      const alrD = await this.prefixModel.findOne({
        _id: data._id,
      });
      if (!alrD) return HttpStatus.BAD_REQUEST;
      return await this.prefixModel.updateOne(
        { _id: data._id },
        { voiceChannelID: data.voiceChannelID },
      );
    } else return HttpStatus.BAD_REQUEST;
  }
}
