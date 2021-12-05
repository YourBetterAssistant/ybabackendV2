import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config({
  path: './.env',
});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    maxAge: 1000 * 60 * 60 * 24,
  });
  app.use(
    Session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production' ? true : false,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
