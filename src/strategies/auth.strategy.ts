import { UserService } from './../user/user.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: process.env.CALLBACKURL,
      scope: ['identify', 'guilds', 'email'],
    });
  }
  async validate(accessToken, refreshToken, profile, done): Promise<any> {
    const { id, username, discriminator, avatar, guilds, email } = profile;
    console.log('test');
    const user = await this.userService?.getUserById(id);
    if (!user) {
      const userObj = {
        discordId: id,
        discordTag: `${username}#${discriminator}`,
        avatar,
        guilds,
        email,
      };
      return done(null, await this.userService.addUserToDB(userObj));
    } else return done(null, user);
  }
}
