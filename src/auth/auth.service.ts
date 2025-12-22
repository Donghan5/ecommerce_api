import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../users/service/user.service";   // import users service
import * as bcrypt from "bcrypt";
import { User } from "../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
	constructor(private userService: UserService, private jwtService: JwtService) {}

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
		});
		return newUser;
	}
	
	async login(user: any) {
		const payload = { email: user.email, sub: user.id };
		return {
			accessToken: this.jwtService.sign(payload),
		};
	}

	async register(registerDto: any) {
		const existingUser = await this.userService.findByEmail(registerDto.email);
		if (existingUser) {
			throw new UnauthorizedException('User already exists');
		}

		const salt = await bcrypt.genSalt();
		const passwordHashed = await bcrypt.hash(registerDto.password, salt);

		const newUser = await this.userService.create({
			email: registerDto.email,
			firstName: registerDto.firstName,
			lastName: registerDto.lastName,
			provider: 'local',
			passwordHash: passwordHashed,
		});

		const { passwordHashed, ...result} = newUser;
		return result;
	}
}