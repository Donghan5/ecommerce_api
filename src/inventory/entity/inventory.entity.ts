import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('inventory')
export class Inventory {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	productId!: string;

	@Column('int', { default: 0 })
	quantityAvailable!: number;

	@Column('int')
	quantityReserved!: number;

	@Column('varchar', { length: 100 })
	warehouseLocation!: string;

	@Column('timestamp')
	lastRestockedAt!: Date;

	@ManyToOne(() => User, (user) => user.inventory)
	user!: User;
}