import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
config({ path: './.env' });
@Module({
  imports: [
    UserModule,
    AuthModule,
    PassportModule.register({ session: true }),
    MongooseModule.forRoot(process.env.DB),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
