import { Injectable, Inject } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Category } from "./entity/category.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Redis } from "ioredis";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(Category)
		private readonly repo: Repository<Category>,
		@Inject('REDIS_CLIENT')
		private readonly redisClient: Redis,
		private readonly httpService: HttpService,
	) { }

	private get goUrl(): string {
		console.log(process.env.GO_ADDRESS)
		return process.env.GO_ADDRESS || 'http://localhost:8080';
	}

	async findAll() {
		try {
			const { data } = await firstValueFrom(
				this.httpService.get(`${this.goUrl}/categories`)
			);
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async findOne(id: string) {
		const category = await this.repo.findOne({ where: { id } });
		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}
		return category;
	}

	async create(createCategoryDto: CreateCategoryDto) {
		const saved = await this.repo.save(createCategoryDto)

		await this.redisClient.del("category_tree")
		return saved
	}

	async update(id: string, updateCategoryDto: UpdateCategoryDto) {
		const updated = await this.repo.update(id, updateCategoryDto)
		await this.redisClient.del("category_tree")
		return updated
	}

	async delete(id: string) {
		const deleted = await this.repo.delete(id)
		await this.redisClient.del("category_tree")
		return deleted
	}
}