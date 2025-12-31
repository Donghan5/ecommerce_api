import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Ecommerce API Flow (e2e)', () => {
	let app: INestApplication;
	let accessToken: string;
	let categoryId: string;
	let productId: string;
	let variantId: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix('api');
		app.useGlobalPipes(new ValidationPipe({
			whitelist: true,
			transform: true
		}));
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	})


	it('/auth/register (POST) - user register', async () => {
		const email = `test_${Date.now()}@example.com`;

		await request(app.getHttpServer())
			.post('/auth/register')
			.send({
				email: email,
				password: 'password213',
				firstName: 'John',
				lastName: 'Doe',
			})
			.expect(201)

		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: email,
				password: 'password213',
			})
			.expect(201);

		accessToken = response.body.accessToken;
		expect(accessToken).toBeDefined();
	});

	it('/categories (POST) - create category', async () => {
		const response = await request(app.getHttpServer())
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
	});

	it('/products (POST) - Creating product', async () => {
		const response = await request(app.getHttpServer())
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
	});

	it('/products/:id/variants (POST) - Creating variant', async () => {
		const response = await request(app.getHttpServer())
			.post(`/products/${productId}/variants`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: 'Black 128GB',
				sku: `TS-BLK-${Date.now()}`,
				price: 1000,
				stock: 10,
				attributes: {
					color: 'Black',
					storage: '128GB',
				}
			})
			.expect(201);
		variantId = response.body.id;
		expect(variantId).toBeDefined();
	});

	it('/carts (POST) - Creating cart', async () => {
		const response = await request(app.getHttpServer())
			.post('/carts')
			.expect(201);

		expect(response.body.id).toBeDefined();
	});
	
})

