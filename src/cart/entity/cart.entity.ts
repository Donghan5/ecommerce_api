import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('carts')
export class Cart {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('varchar', { length: 255 })
	session_id!: string;

	@Column('varchar', { length: 20, default: 'active' })
	status!: string;

	@Column('int', { default: 1 })
	quantity!: number;

	@CreateDateColumn({ type: 'timestamp' })
	created_at!: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at!: Date;

	@ManyToOne(() => User, (user) => user.carts)
	user!: User;
}