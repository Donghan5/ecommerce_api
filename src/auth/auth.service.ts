import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../users/service/user.service";   // import users service
import * as bcrypt from "bcrypt";
import { User } from "../users/entity/user.entity";

@Injectable()
export class AuthService {
	constructor(private userService: UserService) {}

	// verify local user
	async validateLocalUser(email: string, password: string): Promise<User | null> {
		const user = await this.userService.findByEmail(email);
		const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);
		if (user && user.passwordHash && isPasswordMatched) {
			const { passwordHash, ...result } = user;
			return result;
		}
		return null;
	}

	// verify google user
	async validateGoogleUser(details: { email: string; firstName: string; lastName: string; socialId: string }): Promise<User | null> {
		const user = await this.userService.findByEmail(details.email);
		if (user) {
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
}