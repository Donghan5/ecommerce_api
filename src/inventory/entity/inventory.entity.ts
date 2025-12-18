import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ProductVariant } from './product_variant.entity';

@Entity('inventory')
export class Inventory {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('int', { default: 0 })
	quantity_available!: number;

	@Column('int')
	quantity_reserved!: number;

	@Column('varchar', { length: 100 })
	warehouse_location!: string;

	@Column('timestamp')
	last_restored_at!: Date;

	@ManyToOne(() => ProductVariant, (variant) => variant.inventory)
	@JoinColumn({ name: 'variant_id' })
	variant!: ProductVariant;
}