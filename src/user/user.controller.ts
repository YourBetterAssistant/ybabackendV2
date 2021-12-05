import { AuthenticatedGuard } from './../auth/guards/authenticated.guard';
import { UserService } from './user.service';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Users, Guild } from './models/user.model';
import { Request } from 'express';
export interface IRequestWithUser extends Request {
  user: Users;
}
@Controller('user')
export class UserController {
  constructor(private readonly userSerivce: UserService) {}
  @UseGuards(AuthenticatedGuard)
  @Get()
  getSelf(@Req() req: IRequestWithUser): Users {
    return req.user;
  }
  @UseGuards(AuthenticatedGuard)
  @Get('/guilds')
  async getGuilds(@Req() req: IRequestWithUser): Promise<Guild[]> {
    const ug = await this.userSerivce.getBotGuilds();
    return this.userSerivce.getMutualGuilds(req.user.guilds, ug);
  }
  @UseGuards(AuthenticatedGuard)
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
  @UseGuards(AuthenticatedGuard)
  @Get('/guilds/:id/icon')
  async getGuildIcon(@Param('id') id: string): Promise<string | number> {
    return `<img src="${await this.userSerivce.getGuildIcon(
      await this.userSerivce.getGuild(id),
    )}" alt="Discord Guild Icon"/>`;
  }
}
