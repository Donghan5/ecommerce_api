import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Category } from '../../category/entity/category.entity';

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('varchar', { length: 255 }, { nullable: false })
	name!: string;

	@Column('decimal', { precision: 19, scale: 4 })
	base_price!: number;

	@Column('boolean', { default: true })
	is_published!: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	created_at!: Date;

	@ManyToOne(() => Category, (category) => category.products)
	category!: Category;
}