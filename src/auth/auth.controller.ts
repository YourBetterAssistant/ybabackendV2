import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { DiscordGuard } from './guards/discord.guard';
import { UnauthenticatedGuard } from './guards/unauthenticated.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(UnauthenticatedGuard, DiscordGuard)
  @Get('discord')
  signup(): void {
    return;
  }
  @UseGuards(DiscordGuard)
  @Get('discord/redirect')
  getRedirect(@Res() res: Response): void | Response<any, Record<string, any>> {
    return res.redirect(301, process.env.FRONTENDURL);
  }
  @UseGuards(AuthenticatedGuard)
  @Get('signout')
  getSignOut(@Req() req: Request) {
    return this.authService.signout(req);
  }
}
