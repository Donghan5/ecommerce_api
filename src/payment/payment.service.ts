import { Injectable } from "@nestjs/common";
import { PaymentDto } from "./payment.dto";
import { Payment } from "./entity/payment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../order/entity/order.entity";

// mock payment service (for now, stripe)
@Injectable()
export class PaymentService {
	constructor(
		@InjectRepository(Payment)
		private paymentRepository: Repository<Payment>,
	) { }

	async processPayment(order: Order): Promise<Payment> {
		const mockTransationId = `txn_${Date.now()}`;

		const payment = this.paymentRepository.create({
			order: order,
			provider: 'stripe',
			transactionId: mockTransationId,
			amount: order.totalAmount,
			currency: 'USD',
			status: 'paid',
			idempotencyKey: `ikey_${order.id}`,
		});

		return this.paymentRepository.save(payment);
	}
}