import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Category } from '../../category/entity/category.entity';

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	product_id!: string;

	@Column('varchar', { length: 255 }, { nullable: false })
	name!: string;

	@Column('decimal', { precision: 19, scale: 4 })
	basePrice!: number;

	@Column('boolean', { default: true })
	isPublished!: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt!: Date;

	@ManyToOne(() => Category, (category) => category.products)
	category!: Category;
}