import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET', 'sweetpos-dev-secret'),
    });
  }

  async validate(payload: { sub: string; username: string; role: string }) {
    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    };
  }
}
