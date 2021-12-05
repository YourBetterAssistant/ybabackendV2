import { SessionSerializer } from './../serializer/session.serializer';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
