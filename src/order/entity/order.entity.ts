import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('orders')
export class Order {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	userId!: string;

	@Column('varchar', { length: 50 }, { default: 'pending' })
	status!: string;
	
	@Column('decimal', { precision: 19, scale: 4 })
	totalAmount!: number;

	@Column('jsonb')
	shippingAddress!: Record<string, any>;

	@Column('varchar', { length: 50 })
	paymentMethod!: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt!: Date;

	@ManyToOne(() => User, (user) => user.orders)
	user!: User;
}