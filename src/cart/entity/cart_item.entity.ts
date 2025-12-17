import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('cart_items')
export class CartItem {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	cartId!: string;

	@Column('uuid')
	variantId!: string;

	@Column('int', { default: 1 })
	quantity!: number;

	@CreateDateColumn({ type: 'timestamp' })
	addedAt!: Date;

	@ManyToOne(() => User, (user) => user.cartItems)
	user!: User;
}