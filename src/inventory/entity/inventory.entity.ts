import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from '../../product/entity/product_variant.entity';

@Entity('inventories')
export class Inventory {
	@PrimaryGeneratedColumn('uuid') id!: string;

	@Column('int', { default: 0, name: 'quantity_available' }) quantityAvailable!: number;

	@Column('int', { name: 'quantity_reserved' }) quantityReserved!: number;

	@Column('varchar', { length: 100, name: 'warehouse_location' }) warehouseLocation!: string;

	@Column('timestamp', { name: 'last_restored_at' }) lastRestoredAt!: Date;

	@ManyToOne(() => ProductVariant, (variant) => variant.inventories)
	@JoinColumn({ name: 'variant_id' })
	variant!: ProductVariant;
}