"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const ioredis_1 = __importDefault(require("ioredis"));
const product_module_1 = require("./product/product.module");
const user_module_1 = require("./users/user.module");
const auth_module_1 = require("./auth/auth.module");
const order_module_1 = require("./order/order.module");
const cart_module_1 = require("./cart/cart.module");
const category_module_1 = require("./category/category.module");
const payment_module_1 = require("./payment/payment.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST'),
                    port: configService.get('POSTGRES_PORT') || 5432,
                    username: configService.get('POSTGRES_USER'),
                    password: configService.get('POSTGRES_PASSWORD'),
                    database: configService.get('POSTGRES_DB'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true, // Use with development only, disable in production
                    autoLoadEntities: true,
                }),
            }),
            product_module_1.ProductModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            order_module_1.OrderModule,
            cart_module_1.CartModule,
            category_module_1.CategoryModule,
            payment_module_1.PaymentModule,
        ],
        providers: [
            {
                provide: 'REDIS_CLIENT',
                useFactory: (configService) => {
                    return new ioredis_1.default({
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: configService.get('REDIS_PORT') || 6379,
                    });
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: ['REDIS_CLIENT'],
    })
], AppModule);
