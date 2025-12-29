import { Injectable, BadRequestException } from "@nestjs/common";
import { PaymentDto } from "./dto/payment.dto";
import { Payment } from "./entity/payment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../order/entity/order.entity";
import { User } from "../users/entity/user.entity";

// mock payment service (for now, stripe)
@Injectable()
export class PaymentService {
	constructor(
		@InjectRepository(Payment)
		private paymentRepository: Repository<Payment>,
	) { }

	async processPayment(order: Order): Promise<Payment> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const isSuccess = Math.random() > 0.2; 

        if (!isSuccess) {
            console.log(`[Mock Payment] Payment failed for Order ID: ${order.id}`);
            throw new BadRequestException('Payment declined by provider (Mock failure)');
        }

        const mockTransactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const payment = this.paymentRepository.create({
            order: order,
            provider: 'stripe_mock',
            transactionId: mockTransactionId,
            amount: order.totalAmount,
            currency: 'USD',
            status: 'paid',
            idempotencyKey: `ikey_${order.id}`,
        });

        console.log(`[Mock Payment] Payment successful: ${mockTransactionId}`);
        return this.paymentRepository.save(payment);
    }


	async getPaymentByUser(user: User): Promise<Payment[]> {
		return this.paymentRepository.find({ 
			where: {
				order: {
					user: {
						id: user.id
					}
				}
			},
			relations: ['order'],
			order: {
				createdAt: 'DESC'
			}
		});
	}
}