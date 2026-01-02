"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
// setting timeout to 30 seconds
jest.setTimeout(30000);
describe('Ecommerce API Flow (e2e)', () => {
    let app;
    let accessToken;
    let categoryId;
    let productId;
    let variantId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const moduleFixture = yield testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true
        }));
        yield app.init();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (app) {
            yield app.close();
        }
    }));
    it('/auth/register (POST) - user register', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({
            email: 'admin@example.com',
            password: 'password213',
            firstName: 'John',
            lastName: 'Doe',
            provider: 'local',
        })
            .expect(201);
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({
            email: 'admin@example.com',
            password: 'password213',
        })
            .expect(201);
        accessToken = response.body.accessToken;
        expect(accessToken).toBeDefined();
    }));
    it('/categories (POST) - create category', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/categories')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            name: 'TypeScript Electronics',
            slug: `ts-elec-${Date.now()}`,
            displayOrder: 1,
        })
            .expect(201);
        categoryId = response.body.id;
        expect(categoryId).toBeDefined();
    }));
    it('/products (POST) - Creating product', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/products')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            name: 'Test Product',
            description: 'Testing with Jest',
            categoryId: categoryId,
            basePrice: 1000,
        })
            .expect(201);
        productId = response.body.id;
        expect(productId).toBeDefined();
    }));
    it('/products/:id/variants (POST) - Creating variant', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .post(`/products/${productId}/variants`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            name: 'Black 128GB',
            sku: `TS-BLK-${Date.now()}`,
            price: 1000,
            compareAtPrice: 1100,
            stock: 10,
            attributes: {
                color: 'Black',
                storage: '128GB',
            }
        })
            .expect(201);
        variantId = response.body.id;
        expect(variantId).toBeDefined();
    }));
    it('/carts (POST) - Creating cart', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/carts')
            .expect(201);
        expect(response.body.id).toBeDefined();
    }));
});
