import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { Product } from "./entity/product.entity";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductVariant } from "./entity/product_variant.entity";
import { Inventory } from "../inventory/entity/inventory.entity";
import { CreateVariantDto } from "../cart/dto/create-variant.dto";

@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		@InjectRepository(ProductVariant)
		private productVariantRepository: Repository<ProductVariant>,
		@InjectRepository(Inventory)
		private inventoryRepository: Repository<Inventory>,
	) { }

	async createVariant(productId: string, createVariantDto: CreateVariantDto) {
		const product = await this.productRepository.findOne({ where: { id: productId }});
		if (!product) {
			throw new NotFoundException(`Product with ID ${productId} not found`);
		}

		const variant = this.productVariantRepository.create({
			...createVariantDto,
			product,
			compareAtPrice: createVariantDto.price,
			attributes: createVariantDto.attributes || {},
		});

		const savedVariant = await this.productVariantRepository.save(variant);

		const inventory = this.inventoryRepository.create({
			variant: savedVariant,
			quantityAvailable: createVariantDto.stock,
			quantityReserved: 0,
			warehouseLocation: 'Default Warehouse',
			lastRestoredAt: new Date(),
		});
		await this.inventoryRepository.save(inventory);

		return savedVariant;
	}

	async create(createProductDto: CreateProductDto) {
		const product = this.productRepository.create(createProductDto);
		return this.productRepository.save(product);
	}

	async update(id: string, updateProductDto: UpdateProductDto) {
		return this.productRepository.update(id, updateProductDto);
	}

	async remove(id: string) {
		return this.productRepository.delete(id);
	}
}