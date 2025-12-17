import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('carts')
export class Cart {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('uuid')
	cartId!: string;

	@Column('uuid')
	variantId!: string;

	@Column('int', { default: 1 })
	quantity!: number;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt!: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt!: Date;

	@ManyToOne(() => User, (user) => user.carts)
	user!: User;
}