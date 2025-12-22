import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./google.strategy";
import { LocalStrategy } from "./local.strategy";
import { AuthController } from "./auth.controller";
import { UserModule } from "../users/user.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		UserModule,
		PassportModule,
		ConfigModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
	providers: [AuthService, GoogleStrategy, LocalStrategy],
	controllers: [AuthController],
})
export class AuthModule { }