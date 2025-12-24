import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { Product } from "./entity/product.entity";

@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
	) { }

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