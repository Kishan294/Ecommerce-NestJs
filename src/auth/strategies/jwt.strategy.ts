import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';


/**
 * JWT strategy handles the validation of tokens extracted from the Authorization header.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  /**
   * Validates the JWT payload and returns the user data.
   * @param payload The decoded JWT payload.
   * @returns An object containing the user's ID, email, and role.
   */
  async validate(payload: any) {
    // payload is whatever we put in JWT during login
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}