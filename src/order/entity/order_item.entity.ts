import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	order_id!: string;

	@Column('uuid')
	variant_id!: string;

	@Column('varchar', { length: 255 })
	product_name_snapshot!: string;

	@Column('varchar', { length: 100 })
	sku_snapshot!: string;

	@Column('decimal', { precision: 19, scale: 4 })
	price_snapshot!: number;

	@Column('int')
	quantity!: number;

	@Column('decimal', { precision: 19, scale: 4 })
	total_line_price!: number;
}