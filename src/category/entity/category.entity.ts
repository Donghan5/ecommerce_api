import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('categories')
export class Category {
	@PrimaryGeneratedColumn({ type: 'uuid' }) id!: string;

	@ManyToOne(() => Category, (category) => category.children, { nullable: true })
	@JoinColumn({ name: 'parent_id' })
	parentCategory!: Category | null;

	@Column({ type: 'varchar', length: 255 }) name!: string;

	@Column({ type: 'text' }) description!: string;

}