import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { Category } from '../../category/entity/category.entity';
import { ProductVariant } from './product_variant.entity';
import { Inventory } from '../../inventory/entity/inventory.entity';

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('varchar', { length: 255 })
	name!: string;

	@Column('decimal', { precision: 19, scale: 4, name: 'base_price' })
	basePrice!: number;

	@Column('boolean', { default: true, name: 'is_published' })
	isPublished!: boolean;

	@CreateDateColumn({ type: 'timestamp', name: 'created_at' })
	createdAt!: Date;

	@ManyToOne(() => Category, (category) => category.products)
	category!: Category;

	@OneToMany(() => ProductVariant, (variant) => variant.product)
	variants!: ProductVariant[];
}