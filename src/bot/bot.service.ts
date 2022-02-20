import { Injectable } from '@nestjs/common';
const cache = [];
type CommmandStat = [string, command];
type command = {
  name: string;
  description: string;
  aliases: string[];
  category: string;
  cooldown: number;
  memberpermissions: string;
  usage: string;
  run: (client, message, args: string[]) => void;
};
type interaction = {
  name: string;
  guild: boolean;
  description: string;
  permissions: boolean;
  options: {
    type: number;
    name: string;
    description: string;
    required?: boolean;
  }[];
  run: (client: any, interaction: any) => void;
};
type InteractionStat = [string, interaction];
@Injectable()
export class BotService {
  getStats(): any[] {
    return cache;
  }
  postStats(commands: CommmandStat[], interaction: InteractionStat[]) {
    cache.push({
      commands: commands,
      interaction: interaction,
    });
    return 200;
  }
}
