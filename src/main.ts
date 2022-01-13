import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Session from 'express-session';
import * as passport from 'passport';
import { config } from 'dotenv';
import * as compression from 'compression';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
config({
  path: './.env',
});
const host = process.env.REDISHOST;
const rport = process.env.REDISPORT;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: '*',
  });
  const redisStore = connectRedis(Session);
  const redisClient = redis.createClient({
    host,
    port: rport,
  });
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
        sameSite: 'lax',
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
