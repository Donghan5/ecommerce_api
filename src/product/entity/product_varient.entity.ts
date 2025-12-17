import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('product_variants')
export class ProductVariant {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	product_id!: string;

	@Column('varchar', { length: 255 }, { nullable: false })
	name!: string;

	@Column('decimal', { precision: 19, scale: 4 })
	price!: number;

	@Column('decimal', { precision: 19, scale: 4 })
	compareAtPrice!: number;

	@Column('jsonb')
	attributes!: Record<string, any>;

	@Column('boolean', { default: true })
	isActive!: boolean;

	@ManyToOne(() => User, (user) => user.products)
	user!: User;
}