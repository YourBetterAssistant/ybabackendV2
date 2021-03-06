import { users } from './models/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DiscordStrategy } from 'src/strategies/auth.strategy';
import { chatbot } from './models/chatbot.model';
import { prefix } from './models/prefix.model';
import { levellingEnabled } from './models/levellingenabled.model';
import { count } from './models/count.model';
import { memberLog } from './models/memberlog.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'users', schema: users },
      { name: 'chatBot', schema: chatbot },
      { name: 'guild-prefix', schema: prefix },
      { name: 'levellingEnabled', schema: levellingEnabled },
      { name: 'countSchema', schema: count },
      { name: 'logschemas', schema: memberLog },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, DiscordStrategy],
})
export class UserModule {}
