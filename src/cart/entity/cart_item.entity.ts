import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Cart } from './Cart';
import { Variant } from './Variant';

@Entity('cart_items')
export class CartItem {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	cart_id!: string;

	@Column('uuid')
	variant_id!: string;

	@Column('int', { default: 1 })
	quantity!: number;

	@CreateDateColumn({ type: 'timestamp' })
	added_at!: Date;

	// connection with cart db (store item here)
	@ManyToOne(() => Cart, (cart) => cart.items)
	cart!: Cart;

	// connection with variant db (store variant here)
	@ManyToOne(() => Variant, (variant) => variant.items)
	variant!: Variant;
}