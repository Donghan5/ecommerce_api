import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserAddress } from './user_addresses.entity';
import { Cart } from '../../cart/entity/cart.entity';
import { Order } from '../../order/entity/order.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid') id!: string;

	@Column({ type: 'varchar', length: 255, unique: true }) email!: string;

	@Column({ type: 'varchar', length: 50, default: 'local' }) provider!: string;

	@Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' }) passwordHash!: string;

	@Column({ type: 'varchar', length: 255, nullable: true, name: 'social_id'}) socialId!: string;
	
	@Column({ type: 'varchar', length: 100, name: 'first_name' }) firstName!: string;

	@Column({ type: 'varchar', length: 100, name: 'last_name' }) lastName!: string;

	@Column({ type: 'varchar', length: 20, default: 'user' }) role!: string;

	@Column({ type: 'boolean', default: true, name: 'is_active' }) isActive!: boolean;

	@CreateDateColumn({ type: 'timestamp', name: 'created_at' }) createdAt!: Date;

	@UpdateDateColumn({ type: 'timestamp', name: 'updated_at' }) updatedAt!: Date;

	@OneToMany(() => UserAddress, (address) => address.user) addresses!: UserAddress[];

	@OneToMany(() => Order, (order) => order.user) orders!: Order[];

	@OneToMany(() => Cart, (cart) => cart.user) carts!: Cart[];
}
