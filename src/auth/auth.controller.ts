import 'jsonwebtoken';
import { AuthService } from './auth.service';
import { Request, Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }


	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Request() req: any) {
		return this.authService.login(req.user);
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleLogin(@Request() req: any) {
		// Guard send the request to google
	}

	@Get('google/redirect')
	@UseGuards(AuthGuard('google'))
	async googleLoginCallback(@Request() req: any) {
		return this.authService.login(req.user);
	}

	@Post('register')
	async register(@Body() registerDto: CreateUserDto) {
		return this.authService.register(registerDto);
	}
}
