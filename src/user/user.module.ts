import { users } from './models/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DiscordStrategy } from 'src/strategies/auth.strategy';
import { chatBot } from './models/chatbot.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'users', schema: users },
      { name: 'chatBot', schema: chatBot },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, DiscordStrategy],
})
export class UserModule {}
