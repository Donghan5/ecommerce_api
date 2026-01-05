import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { lastValueFrom } from "rxjs";
import { User } from "../users/entity/user.entity";
import { Order } from "./entity/order.entity";
import { OrderItem } from "./entity/order_item.entity";
import { CartItemDto } from "../cart/dto/cart-item.dto";
import { ProductVariant } from "../product/entity/product_variant.entity";
import { PaymentService } from "../payment/payment.service";

@Injectable()
export class OrderService {
	constructor(
		@InjectRepository(Order)
		private orderRepository: Repository<Order>,

		@InjectRepository(OrderItem)
		private orderItemRepository: Repository<OrderItem>,

		@InjectRepository(ProductVariant)
		private productVariantRepository: Repository<ProductVariant>,

		private readonly httpService: HttpService,
		private readonly paymentService: PaymentService,
		private dataSource: DataSource,
	) { }

    private get goUrl(): string {
        return process.env.GO_ADDRESS || 'http://localhost:8080';
    }

	async createOrder(user: User, items: CartItemDto[]) {

		const pendingOrder = await this.savePendingOrder(user, items);

		const reservedItemsTracker: CartItemDto[] = [];

		try {
			await this.decreaseInventory(items, reservedItemsTracker);

			await this.processOrder(pendingOrder);

			return await this.confirmOrder(pendingOrder);

		} catch (error) {
			if (error instanceof Error) {
				console.error('Go Server Inventory Update Failed:', error.message);
			}

			await this.handleOrderFailure(pendingOrder, reservedItemsTracker);

			throw new BadRequestException('Inventory update failed, order cancelled.');
		}
	}

	private async savePendingOrder(user: User, items: CartItemDto[]): Promise<Order> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const order = new Order();
            order.user = user;
            order.status = 'pending';
            order.paymentMethod = 'credit_card';
            order.totalAmount = 0;
            order.shippingAddress = user.addresses?.[0] || {};

            const savedOrder = await queryRunner.manager.save(order);
            let totalAmount = 0;

            for (const item of items) {
                const variant = await this.productVariantRepository.findOne({ where: { id: item.variantId } });
                if (!variant) throw new NotFoundException(`Variant not found: ${item.variantId}`);

                const orderItem = new OrderItem();
                orderItem.order = savedOrder;
                orderItem.variantId = variant.id;
                orderItem.quantity = item.quantity;
                orderItem.productNameSnapshot = variant.name;
                orderItem.skuSnapshot = variant.sku;
                orderItem.priceSnapshot = variant.price;
                orderItem.totalLinePrice = Number(variant.price) * Number(item.quantity);

                totalAmount += orderItem.totalLinePrice;
                await queryRunner.manager.save(orderItem);
            }

            savedOrder.totalAmount = totalAmount;
            await queryRunner.manager.save(savedOrder);
            
            await queryRunner.commitTransaction();
            return savedOrder;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Failed to create pending order');
        } finally {
            await queryRunner.release();
        }
    }

	// helper function to decrease stock
	private async decreaseInventory(items: CartItemDto[], reservedItemsTracker: CartItemDto[]) {
		for (const item of items) {
				const url = this.goUrl + '/inventory/decrease';

				const payload = {
					variant_id: item.variantId,
					quantity: item.quantity,
				};

				await lastValueFrom(this.httpService.post(url, payload));

				reservedItemsTracker.push(item);
			}
	}

	private async processOrder(order: Order) {
		return this.paymentService.processPayment(order);
	}

	private async confirmOrder(order: Order): Promise<Order> {
		order.status = 'confirmed';
		return this.orderRepository.save(order);
	}

	private async handleOrderFailure(order: Order, reservedItemsTracker: CartItemDto[]) {
		for (const item of reservedItemsTracker) {
				try {
					const url = this.goUrl + '/inventory/increase';

					const payload = {
						variant_id: item.variantId,
						quantity: item.quantity
					};

					await lastValueFrom(this.httpService.post(url, payload));
					console.log(`Stock resotred for variant ${item.variantId}`);
				} catch (rollbackError) {
					console.error(`Failed to rollback for variant ${item.variantId}:`, rollbackError);
				}
			}

			await this.orderRepository.delete(order.id);
	}

	async getAllOrders(user: User) {
		return this.orderRepository.find({
			where: { user: { id: user.id } },
			relations: ['items'],
			order: { createdAt: 'DESC' }
		});
	}

	async getOrderById(orderId: string, user: User) {
		const order = await this.orderRepository.findOne({
			where: { id: orderId },
			relations: ['items', 'user'],
		})

		if (!order) {
			throw new NotFoundException('Order not found')
		}

		if (order.user.id !== user.id && user.role !== 'admin') {
			throw new BadRequestException('No right to access this order')
		}

		return order
	}

	async updateOrderStatus(orderId: string, newStatus: string) {
		const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items'] });

		if (!order) {
			throw new NotFoundException('Order not found')
		}

		if (order.status === 'shipped' && newStatus === 'cancelled') {
			throw new BadRequestException('Order cannot be cancelled after it has been shipped or order is already cancelled')
		}

		if (newStatus === 'cancelled' && order.status !== 'cancelled') {
			try {
				for (const item of order.items) {
					const url = this.goUrl + '/inventory/increase';

					const payload = {
						variant_id: item.variantId,
						quantity: item.quantity,
					};

					await lastValueFrom(this.httpService.post(url, payload));
				}
			} catch (error) {
				console.error('Failed to restore stock: ', error);
			}
		}
		order.status = newStatus;

		return this.orderRepository.save(order);
	}

	async deleteOrder(orderId: string) {
		const order = await this.orderRepository.findOne({ where: { id: orderId } });

		if (!order) {
			throw new NotFoundException('Order not found')
		}

		if (order.status === 'shipped') {
			throw new BadRequestException('Order cannot be deleted after it has been shipped')
		}

		await this.orderRepository.delete(orderId);
	}
}