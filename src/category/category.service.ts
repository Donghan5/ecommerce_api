import { Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Category } from "./entity/category.entity";
import { Repository } from "typeorm";
import { Redis } from "ioredis";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
	constructor(
		private readonly repo: Repository<Category>,
		private readonly redisClient: Redis,
	) {}


	async create(createCategoryDto:CreateCategoryDto) {
		const saved = await this.repo.save(createCategoryDto)

		await this.redisClient.del("category_tree")
		return saved
	}

	async update(id:string, updateCategoryDto:UpdateCategoryDto) {
		const updated = await this.repo.update(id, updateCategoryDto)
		await this.redisClient.del("category_tree")
		return updated
	}

	async delete(id:string) {
		const deleted = await this.repo.delete(id)
		await this.redisClient.del("category_tree")
		return deleted
	}
}