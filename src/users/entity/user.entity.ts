import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserAddress } from './user_addresses.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn({ type: 'uuid' })
	id!: string;

	@Column({ type: 'varchar', length: 255, unique: true })
	email!: string;

	@Column({ type: 'varchar', length: 255 })
	password_hash!: string;

	@Column({ type: 'varchar', length: 100 })
	first_name!: string;

	@Column({ type: 'varchar', length: 100 })
	last_name!: string;

	@Column({ type: 'varchar', length: 20 })
	role!: string;

	@Column({ type: 'boolean', default: true })
	is_active!: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	created_at!: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at!: Date;

	@OneToMany(() => UserAddress, (address) => address.user)
	addresses!: UserAddress[];
}
