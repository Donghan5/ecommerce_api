import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn({ type: 'uuid' })
    id!: string;

    @ManyToOne(() => Category, (category) => category.children, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_id' })
    parentCategory!: Category | null;

    @OneToMany(() => Category, (category) => category.parentCategory)
    children!: Category[];

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    slug!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ type: 'int', default: 0 })
    displayOrder!: number;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;
}