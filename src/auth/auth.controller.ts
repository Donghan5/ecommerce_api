import 'jsonwebtoken';
import { AuthService } from './auth.service';
import { Request, Response, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	
	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Request() req) {
		return this.authService.login(req.user);
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleLogin(@Request() req) {
		// Guard send the request to google
	}

	@Get('google/redirect')
	@UseGuards(AuthGuard('google'))
	async googleLoginCallback(@Request() req) {
		return this.authService.login(req.user);
	}

	@Post('register')
	async register(@Body() registerDto: any) {
		return this.authService.register(registerDto);
	}
}
