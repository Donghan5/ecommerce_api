import { Strategy } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
        super({
            clientID: this.configService.get<string>('GOOGLE_CLIENT_ID'), 
            clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: "http://localhost:3000/auth/google/redirect",
            scope: ["email", "profile"],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
        // extract important information from google profile
        const { name, emails, id } = profile;
        
        const user = await this.authService.validateGoogleUser({
            email: emails?.[0].value || "",
            firstName: name?.givenName || "",
            lastName: name?.familyName || "",
            socialId: id,
        });

        return user || null;
    }
}