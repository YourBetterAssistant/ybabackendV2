import { users } from './models/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DiscordStrategy } from 'src/strategies/auth.strategy';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'users', schema: users }])],
  controllers: [UserController],
  providers: [UserService, DiscordStrategy],
})
export class UserModule {}
