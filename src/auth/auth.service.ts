import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../users/user.service";   // import users service
import * as bcrypt from "bcrypt";
import { User } from "../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService, 
		private jwtService: JwtService, 
		private configService: ConfigService
	) { }

	// verify local user
	async validateLocalUser(email: string, password: string): Promise<User | null> {
		const user = await this.userService.findByEmail(email);

		if (user && user.provider === 'local' && user.passwordHash) {
			const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);
			if (isPasswordMatched) {
				const { passwordHash, ...result } = user;
				return result as User;
			}
		}
		return null;
	}

	// verify google user
	async validateGoogleUser(details: { email: string; firstName: string; lastName: string; socialId: string }): Promise<User | null> {
		const user = await this.userService.findByEmail(details.email);
		if (user && user.provider === 'google') {
			return user;
		}

		console.log('User not found, creating new user');

		const newUser = await this.userService.create({
			email: details.email,
			firstName: details.firstName,
			lastName: details.lastName,
			provider: 'google',
			passwordHash: '',
			socialId: details.socialId,
		} as any);
		return newUser;
	}

	async login(user: any) {
		const payload = { email: user.email, sub: user.id, role: user.role };
		return {
			accessToken: this.jwtService.sign(payload),
		};
	}

	async register(registerDto: CreateUserDto) {
		const existingUser = await this.userService.findByEmail(registerDto.email);
		if (existingUser) {
			throw new UnauthorizedException('User already exists');
		}

		const salt = await bcrypt.genSalt();
		const passwordHashed = await bcrypt.hash(registerDto.password, salt);

		const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

		const role = registerDto.email === adminEmail ? 'admin' : 'user';

		const newUser = await this.userService.create({
			...registerDto,
			provider: 'local',
			passwordHash: passwordHashed,
			role: role,
		} as any);

		const { passwordHash, ...result } = newUser;
		return result;
	}
}