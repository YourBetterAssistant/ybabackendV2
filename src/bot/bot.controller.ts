import { BotService } from './bot.service';
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('bot')
export class BotController {
  constructor(private readonly Bot: BotService) {}
  @Get('/stats')
  getStats(): any[] {
    return this.Bot.getStats();
  }
  @Post('/stats/update')
  postStats(
    @Body() body: { secret: string; commands: any[]; interaction: any[] },
  ): number {
    if (body.secret !== process.env.APISECRET) return 403;
    return this.Bot.postStats(body.commands, body.interaction);
  }
}
