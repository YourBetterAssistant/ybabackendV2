import { AuthenticatedGuard } from './../auth/guards/authenticated.guard';
import { UserService } from './user.service';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Users } from './models/user.model';

@Controller('user')
export class UserController {
  constructor(private readonly userSerivce: UserService) {}
  @UseGuards(AuthenticatedGuard)
  @Get()
  getSelf(@Req() req): Users {
    return req.user;
  }
  @UseGuards(AuthenticatedGuard)
  @Get('/guilds')
  async getGuilds(@Req() req) {
    const ug = await this.userSerivce.getBotGuilds();
    return this.userSerivce.getMutualGuilds(req.user.guilds, ug);
  }
}
