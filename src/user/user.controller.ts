import { AuthenticatedGuard } from './../auth/guards/authenticated.guard';
import { UserService } from './user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Users, Guild } from './models/user.model';
import { Request, Response } from 'express';
export interface IRequestWithUser extends Request {
  user: Users;
}
type chatbot = {
  guildID: string;
  channelID: string;
};

@UseGuards(AuthenticatedGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userSerivce: UserService) {}
  @Get()
  getSelf(@Req() req: IRequestWithUser): Users {
    return req.user;
  }
  @Get('/guilds')
  async getGuilds(@Req() req: IRequestWithUser): Promise<Guild[]> {
    const ug = await this.userSerivce.getBotGuilds();
    return this.userSerivce.getMutualGuilds(req.user.guilds, ug);
  }
  @Get('/guilds/:id')
  async getGuild(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
  ): Promise<Guild> {
    return (
      await this.userSerivce.getMutualGuilds(
        req.user.guilds,
        await this.userSerivce.getBotGuilds(),
      )
    ).find((g) => g.id === id);
  }
  @Get('/guilds/:id/icon')
  async getGuildIcon(@Param('id') id: string): Promise<string | number> {
    return `<img src="${await this.userSerivce.getGuildIcon(
      await this.userSerivce.getGuild(id),
    )}" alt="Discord Guild Icon"/>`;
  }
  @Post('/guilds/features/chatbot')
  async postChatBot(
    @Body() body: chatbot,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .json({ error: 'User is not in guild with correct permissions' })
        .status(HttpStatus.NOT_ACCEPTABLE);
    if (!body.channelID && !body.guildID)
      return res
        .json({ error: 'Missing channel or guild id' })
        .status(HttpStatus.NOT_ACCEPTABLE);
    else
      return await this.userSerivce.accessChatBotDB('NEW', {
        guildID: body.guildID,
        channelID: body.channelID,
      });
  }
  @Delete('/guilds/features/chatbot')
  async deleteChatBot(
    @Body() body: chatbot,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .json({ error: 'User is not in guild with correct permissions' })
        .status(HttpStatus.NOT_ACCEPTABLE);
    if (!body.guildID)
      return res
        .json({ error: 'EXPECTED GUILDID TO BE VALID' })
        .status(HttpStatus.NOT_ACCEPTABLE);
    else
      return await this.userSerivce.accessChatBotDB('DELETE', {
        guildID: body.guildID,
        channelID: 'NOT_REQUIRED',
      });
  }
  @Put('/guilds/features/chatbot')
  async putChatBot(
    @Body() body: chatbot,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .json({ error: 'User is not in guild with correct permissions' })
        .status(HttpStatus.NOT_ACCEPTABLE);
    if (!body.channelID && !body.guildID)
      return res
        .json({ error: 'Missing channel or guild id' })
        .status(HttpStatus.NOT_ACCEPTABLE);
    else
      return await this.userSerivce.accessChatBotDB('EDIT', {
        guildID: body.guildID,
        channelID: body.channelID,
      });
  }
}
