"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../users/user.service"); // import users service
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(userService, jwtService, configService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    // verify local user
    validateLocalUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findByEmail(email);
            if (user && user.provider === 'local' && user.passwordHash) {
                const isPasswordMatched = yield bcrypt.compare(password, user.passwordHash);
                if (isPasswordMatched) {
                    const { passwordHash } = user, result = __rest(user, ["passwordHash"]);
                    return result;
                }
            }
            return null;
        });
    }
    // verify google user
    validateGoogleUser(details) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findByEmail(details.email);
            if (user && user.provider === 'google') {
                return user;
            }
            console.log('User not found, creating new user');
            const newUser = yield this.userService.create({
                email: details.email,
                firstName: details.firstName,
                lastName: details.lastName,
                provider: 'google',
                passwordHash: '',
                socialId: details.socialId,
            });
            return newUser;
        });
    }
    login(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = { email: user.email, sub: user.id, role: user.role };
            return {
                accessToken: this.jwtService.sign(payload),
            };
        });
    }
    register(registerDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.userService.findByEmail(registerDto.email);
            if (existingUser) {
                throw new common_1.UnauthorizedException('User already exists');
            }
            const salt = yield bcrypt.genSalt();
            const passwordHashed = yield bcrypt.hash(registerDto.password, salt);
            const adminEmail = this.configService.get('ADMIN_EMAIL');
            const role = registerDto.email === adminEmail ? 'admin' : 'user';
            const newUser = yield this.userService.create(Object.assign(Object.assign({}, registerDto), { provider: 'local', passwordHash: passwordHashed, role: role }));
            const { passwordHash } = newUser, result = __rest(newUser, ["passwordHash"]);
            return result;
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
