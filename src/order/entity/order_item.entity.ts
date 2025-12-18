import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
	@PrimaryGeneratedColumn('uuid') id!: string;

	@Column('uuid', { name: 'order_id' }) orderId!: string;

	@Column('uuid', { name: 'variant_id' }) variantId!: string;

	@Column('varchar', { length: 255, name: 'product_name_snapshot' }) productNameSnapshot!: string;

	@Column('varchar', { length: 100, name: 'sku_snapshot' }) skuSnapshot!: string;

	@Column('decimal', { precision: 19, scale: 4, name: 'price_snapshot' }) priceSnapshot!: number;

	@Column('int') quantity!: number;

	@Column('decimal', { precision: 19, scale: 4, name: 'total_line_price' }) totalLinePrice!: number;
}