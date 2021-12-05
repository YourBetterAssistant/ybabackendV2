import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guild, Users } from './models/user.model';
import * as axios from 'Axios';
const Axios = axios.default;
@Injectable()
export class UserService {
  constructor(@InjectModel('users') private readonly userModel: Model<Users>) {}
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
    const response = await Axios.get(
      'http://discord.com/api/v9/users/@me/guilds',
      {
        method: 'GET',
        headers: {
          Authorization: `Bot ${process.env.BOTTOKEN}`,
        },
      },
    );
    return response.data;
  }
  async getChannels(guildId) {
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
}
