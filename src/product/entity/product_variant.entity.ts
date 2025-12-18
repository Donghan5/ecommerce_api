import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	product_id!: string;

	@Column('varchar', { length: 255 }, { nullable: false })
	name!: string;

	@Column('varchar', { length: 100 })
	sku!: string;

	@Column('decimal', { precision: 19, scale: 4 })
	price!: number;

	@Column('decimal', { precision: 19, scale: 4 })
	compare_at_price!: number;

	@Column('jsonb')
	attributes!: Record<string, any>;

	@Column('boolean', { default: true })
	is_active!: boolean;

	@ManyToOne(() => Product, (product) => product.variants)
	@JoinColumn({ name: 'product_id' })
	product!: Product;
}