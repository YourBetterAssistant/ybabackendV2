import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Session from 'express-session';
import * as passport from 'passport';
import { config } from 'dotenv';
import * as compression from 'compression';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import { NestExpressApplication } from '@nestjs/platform-express';
config({
  path: './.env',
});
const host = process.env.REDISHOST;
const rport = process.env.REDISPORT;
async function bootstrap() {
  const url = `redis://${host}:${rport}`;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    credentials: true,
    origin: true,
  });
  app.set('trust proxy', 1);
  const redisStore = connectRedis(Session);
  const redisClient = redis.createClient({
    url,
    legacyMode: true,
  });
  redisClient.connect();
  redisClient.on('connect', function (err) {
    err ? console.error(err) : null;
    console.log('redis connected');
  });
  app.use(compression());
  app.use(
    Session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: false,
        sameSite: 'none',
        secure: true,
      },
      store: new redisStore({ client: redisClient }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.setGlobalPrefix('api');
  const port = process.env.PORT || 3003;
  await app
    .listen(port)
    .then(() => console.log('Server Running On Port:' + port));
}
bootstrap();
