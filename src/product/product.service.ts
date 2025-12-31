import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { Product } from "./entity/product.entity";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateVariantDto } from "../cart/dto/create-variant.dto";
import { ProductVariant } from "./entity/product_variant.entity";
import { Inventory } from "../inventory/entity/inventory.entity";

@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		@InjectRepository(ProductVariant)
		private productVariantRepository: Repository<ProductVariant>,
		@InjectRepository(Inventory)
		private inventoryRepository: Repository<Inventory>,
		private dataSource: DataSource,
	) { }

	async createVariant(productId: string, createVariantDto: CreateVariantDto) {
		const product = await this.productRepository.findOne({ where: { id: productId }});
		if (!product) {
			throw new NotFoundException(`Product with ID ${productId} not found`);
		}

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const variant = queryRunner.manager.create(ProductVariant, {
				...createVariantDto,
				product,
				compareAtPrice: createVariantDto.compareAtPrice ?? createVariantDto.price,
				attributes: createVariantDto.attributes || {},
			});

			const savedVariant = await queryRunner.manager.save(variant);

			const inventory = queryRunner.manager.create(Inventory, {
				variant: savedVariant,
				quantityAvailable: createVariantDto.stock,
				quantityReserved: 0,
				warehouseLocation: 'Default Warehouse',
				lastRestoredAt: new Date(),
			});
			await this.inventoryRepository.save(inventory);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async create(createProductDto: CreateProductDto) {
		const product = this.productRepository.create(createProductDto);
		return this.productRepository.save(product);
	}

	async update(id: string, updateProductDto: UpdateProductDto) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.productRepository.update(id, updateProductDto);

        return this.productRepository.findOne({ where: { id } });
    }

    async remove(id: string) {
        const result = await this.productRepository.delete(id);
        
        if (result.affected === 0) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return { message: `Product ${id} successfully deleted` };
    }
}