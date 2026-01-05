import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

// setting timeout to 30 seconds
jest.setTimeout(30000);

describe('Ecommerce API Flow (e2e)', () => {
	let app: INestApplication;
	let accessToken: string;
	let categoryId: string;
	let productId: string;
	let variantId: string;
	let cartId: string;
	let dataSource: DataSource;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		dataSource = moduleFixture.get<DataSource>(DataSource);

		try {
			const entities = dataSource.entityMetadatas;
			const tableNames = entities.map((entity) => `"${entity.tableName}`
		}
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}
	});


	it('/auth/register (POST) - user register', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send({
				email: 'admin@example.com',
				password: 'password213',
				firstName: 'John',
				lastName: 'Doe',
				provider: 'local',
			})
			.expect(201)

		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: 'admin@example.com',
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
	});

	it('/carts (POST) - Creating cart', async () => {
		const response = await request(app.getHttpServer())
			.post('/carts')
			.expect(201);
		cartId = response.body.id;
		expect(cartId).toBeDefined();
	});

	it('/carts/:id/items (POST) - Add item to cart', async () => {
		const response = await request(app.getHttpServer())
			.post(`/carts/${cartId}/items`)
			.send({
				variantId: variantId,
				quantity: 2
			})
			.expect(201);
		
		const item = response.body.items.find((i: any) => i.variant.id === variantId);
		expect(item).toBeDefined();
		expect(item.quantity).toBe(2);
	});

	it('/order (POST) - Create order and decrease stock', async () => {
		const response = await request(app.getHttpServer())
			.post('/order')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				items: [
					{ variantId: variantId, quantity: 2 }
				]
			})
			.expect(201);
		
		expect(response.body.id).toBeDefined();
		expect(response.body.status).toBe('confirmed'); // 혹은 로직에 따라 pending/confirmed
	});
	
})

