import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { OrderItem } from './order_item.entity';

@Entity('orders')
export class Order {
	@PrimaryGeneratedColumn('uuid') id!: string;

	@Column('varchar', { length: 50 }, { default: 'pending' }) status!: string;

	@Column('decimal', { precision: 19, scale: 4, name: 'total_amount' }) totalAmount!: number;

	@Column('jsonb', { name: 'shipping_address' }) shippingAddress!: Record<string, any>;

	@Column('varchar', { length: 50 }) paymentMethod!: string;

	@CreateDateColumn({ type: 'timestamp', name: 'created_at' }) createdAt!: Date;

	@ManyToOne(() => User, (user) => user.orders)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
	items!: OrderItem[];
}