import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserAddress } from './user_addresses.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn({ type: 'uuid' }) id!: string;

	@Column({ type: 'varchar', length: 255, unique: true }) email!: string;

	@Column({ type: 'varchar', length: 50, default: 'local' }) provider!: string;

	@Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' }) passwordHash!: string;

	@Column({ type: 'varchar', length: 255, nullable: true, name: 'social_id'}) socialId!: string;
	
	@Column({ type: 'varchar', length: 100, name: 'first_name' }) firstName!: string;

	@Column({ type: 'varchar', length: 100, name: 'last_name' }) lastName!: string;

	@Column({ type: 'varchar', length: 20 }) role!: string;

	@Column({ type: 'boolean', default: true, name: 'is_active' }) isActive!: boolean;

	@CreateDateColumn({ type: 'timestamp', name: 'created_at' }) createdAt!: Date;

	@UpdateDateColumn({ type: 'timestamp', name: 'updated_at' }) updatedAt!: Date;

	@OneToMany(() => UserAddress, (address) => address.user) addresses!: UserAddress[];
}
