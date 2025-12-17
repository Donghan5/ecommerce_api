import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Order } from './Order';

@Entity('payments')
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	orderId!: string;

	@Column('varchar', { length: 50 })
	provider!: string;

	@Column('varchar', { length: 255 })
	transactionId!: string;

	@Column('decimal', { precision: 19, scale: 4 })
	amount!: number;

	@Column('varchar', { length: 3 })
	currency!: string;

	@Column('varchar', { length: 50 })
	status!: string;

	@Column('varchar', { length: 255, unique: true })
	idempotencyKey!: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt!: Date;

	@ManyToOne(() => Order, (order) => order.payments)
	order!: Order;
}