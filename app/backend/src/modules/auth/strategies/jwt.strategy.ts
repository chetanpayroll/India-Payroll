import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
        });
    }

    async validate(payload: any) {
        const user = await this.authService.validateUser(payload);

        if (!user) {
            throw new UnauthorizedException();
        }

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            vendorId: payload.vendorId,
            clientId: payload.clientId,
        };
    }
}
