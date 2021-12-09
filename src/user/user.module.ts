import { users } from './models/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DiscordStrategy } from 'src/strategies/auth.strategy';
import { chatbot } from './models/chatbot.model';
import { prefix } from './models/prefix.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'users', schema: users },
      { name: 'chatBot', schema: chatbot },
      { name: 'guild-prefix', schema: prefix },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, DiscordStrategy],
})
export class UserModule {}
