import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_addresses')
export class UserAddress {
	@PrimaryGeneratedColumn({ type: 'uuid' })
	id!: string;

	@ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column({ type: 'uuid' })
	user_id!: string;

	@Column({ type: 'varchar', length: 255 })
	addressLine1!: string;

	@Column({ type: 'varchar', length: 255 })
	addressLine2!: string;

	@Column({ type: 'varchar', length: 100 })
	city!: string;

	@Column({ type: 'varchar', length: 20 })
	postal_code!: string;

	@Column({ type: 'varchar', length: 100 })
	country!: string;

	@Column({ type: 'boolean', default: true })
	is_default!: boolean;
}