import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	orderId!: string;

	@Column('uuid')
	variantId!: string;

	@Column('varchar', { length: 255 })
	productNameSnapshot!: string;

	@Column('varchar', { length: 100 })
	skuSnapshot!: string;

	@Column('decimal', { precision: 19, scale: 4 })
	priceSnapshot!: number;

	@Column('int')
	quantity!: number;

	@Column('decimal', { precision: 19, scale: 4 })
	totalLinePrice!: number;
}