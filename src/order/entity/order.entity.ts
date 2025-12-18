import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@Entity('orders')
export class Order {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('varchar', { length: 50 }, { default: 'pending' })
	status!: string;
	
	@Column('decimal', { precision: 19, scale: 4 })
	total_amount!: number;

	@Column('jsonb')
	shipping_address!: Record<string, any>;

	@Column('varchar', { length: 50 })
	payment_method!: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at!: Date;

	@ManyToOne(() => User, (user) => user.orders)
	@JoinColumn({ name: 'user_id' })
	user!: User;
}