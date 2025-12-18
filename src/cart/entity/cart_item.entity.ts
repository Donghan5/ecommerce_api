import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Cart } from '../../cart/entity/cart.entity';
import { ProductVariant } from '../../product/entity/product_variant.entity';

@Entity('cart_items')
export class CartItem {
	@PrimaryGeneratedColumn('uuid') id!: string;

	@Column('int', { default: 1 }) quantity!: number;

	@CreateDateColumn({ type: 'timestamp', name: 'added_at' }) addedAt!: Date;

	// connection with cart db (store item here)
	@ManyToOne(() => Cart, (cart) => cart.items)
	@JoinColumn({ name: 'cart_id' })
	cart!: Cart;

	// connection with variant db (store variant here)
	@ManyToOne(() => ProductVariant, (variant) => variant.items)
	@JoinColumn({ name: 'variant_id' })
	variant!: ProductVariant;
}