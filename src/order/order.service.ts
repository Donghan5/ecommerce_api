import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { lastValueFrom } from "rxjs";
import { User } from "../users/entity/user.entity";
import { Order } from "./entity/order.entity";
import { OrderItem } from "./entity/order-item.entity";
import { CartItem } from "../cart/entity/cart_item.entity";

@Injectable()
export class OrderService {
	constructor(
		@InjectRepository(Order)
		private orderRepository: Repository<Order>,

		@InjectRepository(OrderItem)
		private orderItemRepository: Repository<OrderItem>,

		private readonly httpService: HttpService,
		private dataSource: DataSource,
	) { }

	async createOrder(user: User, items: CartItem[]) {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		let savedOrder: Order;

		try {
			const order = new Order();
			order.user = user;
			order.status = 'pending';
			order.paymentMethod = 'credit_card';
			order.totalAmount = 0;
			order.shippingAddress = user.address;

			savedOrder = await queryRunner.manager.save(order);

			let totalAmount = 0;
			for (const item of items) {
				const orderItem = new OrderItem();
				orderItem.order = savedOrder;
				orderItem.variantId = item.variant.id; // import from cart_item
				orderItem.quantity = item.quantity;

				orderItem.productNameSnapShot = item.variant.name;
				orderItem.skuSnapShot = item.variant.sku;
				orderItem.priceSnapShot = item.variant.base_price;

				orderItem.totalLinePrice = Number(item.variant.base_price) * Number(item.quantity);
				totalAmount += orderItem.totalLinePrice;

				await queryRunner.manager.save(orderItem);
			}
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw new InternalServerErrorException('Failed to create order');
		} finally {
			await queryRunner.release();
		}

		try {
			for (const item of items) {
				const url = 'http://go_app:8080/inventory/decrease';

				const payload = {
					variant_id: item.variant.id,
					quantity: item.quantity,
				};

				await lastValueFrom(this.httpService.post(url, payload));

				savedOrder.status = 'confirmed';
				await this.orderRepository.save(savedOrder);

				return savedOrder;
			}
		} catch (error) {
			console.error('Go Server failed:', error.message);

			await this.orderRepository.delete(savedOrder.id);

			throw new BadRequestException('Failed to create order');
		}
	}

	async getAllOrders() { }

	async getOrderById() { }

	async updateOrder() { }

	async deleteOrder() { }
}