import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthService {
  signout(req: Request) {
    req.logout();
    req.session.destroy((err) => {
      if (err) {
        return err;
      }
    });
    return 200;
  }
}
