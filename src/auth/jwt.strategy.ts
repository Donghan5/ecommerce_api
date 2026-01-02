import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private configSerivice: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configSerivice.get<string>('JWT_SECRET') || 'defaultSecretKey',
		});
	}
	
	async validate(payload: any) {
		return {
			id: payload.sub,
			email: payload.email,
			role: payload.role || 'user',
		};
	}
}