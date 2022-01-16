import { Prefix } from './models/prefix.model';
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
import { Chatbot } from './models/chatbot.model';
import { Count } from './models/count.model';
import {
  LevellingEnabled,
  levellingEnabled,
} from './models/levellingenabled.model';
export interface IRequestWithUser extends Request {
  user: Users;
}

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
  async getGuildIcon(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    res.setHeader('Content-Type', 'image/jpeg');
    return res.send(
      `<img src="${await this.userSerivce.getGuildIcon(
        await this.userSerivce.getGuild(id),
      )}" alt="${await this.userSerivce.getGuildIcon(
        await this.userSerivce.getGuild(id),
      )}"/>`,
    );
  }
  @Post('/guilds/features/chatbot')
  async postChatBot(
    @Body() body: Chatbot,
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
      return res.send(
        await this.userSerivce.accessChatBotDB('NEW', {
          guildID: body.guildID,
          channelID: body.channelID,
        }),
      );
  }
  @Delete('/guilds/features/chatbot')
  async deleteChatBot(
    @Body() body: Chatbot,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });

    if (!body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'EXPECTED GUILDID TO BE VALID' });
    else
      return res.send(
        await this.userSerivce.accessChatBotDB('DELETE', {
          guildID: body.guildID,
          channelID: 'NOT_REQUIRED',
        }),
      );
  }
  @Put('/guilds/features/chatbot')
  async putChatBot(
    @Body() body: Chatbot,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });

    if (!body.channelID && !body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing channel or guild id' });
    else
      return res.send(
        await this.userSerivce.accessChatBotDB('EDIT', {
          guildID: body.guildID,
          channelID: body.channelID,
        }),
      );
  }
  @Post('/guilds/features/prefix')
  async postPrefix(
    @Body() body: Prefix,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.prefix && !body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing prefix or guild id' });
    else
      return res.send(
        await this.userSerivce.accessPrefixDB('NEW', {
          guildID: body.guildID,
          prefix: body.prefix,
        }),
      );
  }
  @Delete('/guilds/features/prefix')
  async deletePrefix(
    @Body() body: Prefix,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing guild id' });
    else
      return res.send(
        await this.userSerivce.accessPrefixDB('DELETE', {
          guildID: body.guildID,
          prefix: 'NOT_REQUIRED',
        }),
      );
  }
  @Put('/guilds/features/prefix')
  async editPrefix(
    @Body() body: Prefix,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.prefix && !body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing prefix or guild id' });
    else
      return res.send(
        await this.userSerivce.accessPrefixDB('EDIT', {
          guildID: body.guildID,
          prefix: body.prefix,
        }),
      );
  }
  @Post('/guilds/features/levellingEnabled')
  async newLevellingEnabled(
    @Body() body: LevellingEnabled,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.enabled && !body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing prefix or guild id' });
    else
      return res.send(
        await this.userSerivce.accesLevellingEnabledDB('NEW', {
          guildID: body.guildID,
          enabled: body.enabled,
        }),
      );
  }
  @Delete('/guilds/features/levellingEnabled')
  async deleteLevellingEnabled(
    @Body() body: LevellingEnabled,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing guild id' });
    else
      return res.send(
        await this.userSerivce.accesLevellingEnabledDB('DELETE', {
          guildID: body.guildID,
          enabled: false,
        }),
      );
  }
  @Put('/guilds/features/levellingEnabled')
  async editLevellingEnabled(
    @Body() body: LevellingEnabled,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body.guildID)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.enabled && !body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing prefix or guild id' });
    else
      return res.send(
        await this.userSerivce.accesLevellingEnabledDB('EDIT', {
          guildID: body.guildID,
          enabled: body.enabled,
        }),
      );
  }
}
