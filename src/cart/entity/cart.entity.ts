import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@Entity('carts')
export class Cart {
	@PrimaryGeneratedColumn('uuid') id!: string;

	@Column('varchar', { length: 255, name: 'session_id' }) sessionId!: string;

	@Column('varchar', { length: 20, default: 'active' }) status!: string;

	@CreateDateColumn({ type: 'timestamp', name: 'created_at' }) createdAt!: Date;

	@UpdateDateColumn({ type: 'timestamp', name: 'updated_at' }) updatedAt!: Date;

	@ManyToOne(() => User, (user) => user.carts)
	@JoinColumn({ name: 'user_id' })
	user!: User;
}