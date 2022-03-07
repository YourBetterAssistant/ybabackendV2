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
import { LevellingEnabled } from './models/levellingenabled.model';
import { MemberLog } from './models/memberlog.model';
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
    @Res({ passthrough: true }) res: Response,
  ): Promise<Guild | string> {
    const botguilds = await this.userSerivce.getBotGuilds();
    const returned = (
      await this.userSerivce.getMutualGuilds(req.user.guilds, botguilds)
    ).find((g) => g.id === id);
    if (!returned) {
      res.status(HttpStatus.UNAUTHORIZED);
      return 'User is not in guild';
    } else return returned;
  }
  @Get('/guilds/:id/icon')
  async getGuildIcon(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<any> {
    return res.send(
      await this.userSerivce.getGuildIcon(await this.userSerivce.getGuild(id)),
    );
  }
  @Get('/guilds/:id/channels')
  async getChannels(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
    @Res() res: Response,
  ) {
    const isInGuild = await this.userSerivce.checkIfUserIsInGuild(req.user, id);
    if (!isInGuild)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild' });
    return res.send(await this.userSerivce.getChannels(id));
  }
  @Get('/guilds/:id/channels/text')
  async getTextChannels(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
    @Res() res: Response,
  ) {
    const isInGuild = await this.userSerivce.checkIfUserIsInGuild(req.user, id);
    if (!isInGuild)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild' });
    return res.send(
      (await this.userSerivce.getChannels(id)).filter((c) => c.type === 0),
    );
  }
  @Post('/guilds/features/chatbot')
  async postChatBot(
    @Body() body: Chatbot,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    const isInGuild = await this.userSerivce.checkIfUserIsInGuild(
      req.user,
      body.guildID,
    );
    if (!isInGuild)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.channelID && !body.guildID)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing channel or guild id' });
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
    const guildis = await this.userSerivce.checkIfUserIsInGuild(
      req.user,
      body.guildID,
    );
    if (!guildis) {
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    }
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
        .json({ error: 'Missing Enabled or guild id' });
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
        .json({ error: 'Missing Enabled or guild id' });
    else
      return res.send(
        await this.userSerivce.accesLevellingEnabledDB('EDIT', {
          guildID: body.guildID,
          enabled: body.enabled,
        }),
      );
  }
  //Starting Count Model
  @Post('/guilds/features/count')
  async newCount(
    @Body() body: Count,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body._id)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.voiceChannelID && !body._id)
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({
        error:
          'Missing Count or guild id, expected _id or voiceChannelID to have content',
      });
    else
      return res.send(
        await this.userSerivce.accesCountSchemaDB('NEW', {
          _id: body._id,
          voiceChannelID: body.voiceChannelID,
        }),
      );
  }
  @Delete('/guilds/features/count')
  async deleteCount(
    @Body() body: Count,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body._id)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body._id)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing guild id, expected _id to have content' });
    else
      return res.send(
        await this.userSerivce.accesCountSchemaDB('DELETE', {
          _id: body._id,
          voiceChannelID: 'NOT_REQUIRED',
        }),
      );
  }
  @Put('/guilds/features/count')
  async editCount(
    @Body() body: Count,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body._id)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.voiceChannelID && !body._id)
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({
        error:
          'Missing Count or guild id, expected _id or voiceChannelID to have content ',
      });
    else
      return res.send(
        await this.userSerivce.accesCountSchemaDB('EDIT', {
          _id: body._id,
          voiceChannelID: body.voiceChannelID,
        }),
      );
  }
  //starting Log Schema
  @Post('/guilds/features/memberlog')
  async newLog(
    @Body() body: MemberLog,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body._id)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.channelID && !body._id)
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({
        error:
          'Missing Log or guild id, expected _id or channelID to have content',
      });
    else
      return res.send(
        await this.userSerivce.accessLogSchemaDB('NEW', {
          _id: body._id,
          channelID: body.channelID,
        }),
      );
  }
  @Delete('/guilds/features/memberlog')
  async deleteLog(
    @Body() body: MemberLog,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body._id)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body._id)
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'Missing guild id, expected _id to have content' });
    else
      return res.send(
        await this.userSerivce.accessLogSchemaDB('DELETE', {
          _id: body._id,
          channelID: 'NOT_REQUIRED',
        }),
      );
  }
  @Put('/guilds/features/memberlog')
  async editLog(
    @Body() body: MemberLog,
    @Res() res: Response,
    @Req() req: IRequestWithUser,
  ) {
    if (!(await this.userSerivce.checkIfUserIsInGuild(req.user, body._id)))
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ error: 'User is not in guild with correct permissions' });
    if (!body.channelID && !body._id)
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({
        error:
          'Missing log or guild id, expected _id or channelID to have content ',
      });
    else
      return res.send(
        await this.userSerivce.accessLogSchemaDB('EDIT', {
          _id: body._id,
          channelID: body.channelID,
        }),
      );
  }
}
