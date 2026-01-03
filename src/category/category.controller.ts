import { Controller } from "@nestjs/common"
import { Post, Patch, Delete, Get } from "@nestjs/common/decorators"
import { Body, Param } from "@nestjs/common/decorators"
import { UseGuards } from "@nestjs/common/decorators"
import { AuthGuard } from "@nestjs/passport"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { CreateCategoryDto } from "./dto/create-category.dto"
import { CategoryService } from "./category.service"
import { UpdateCategoryDto } from "./dto/update-category.dto"

@Controller("categories")
export class CategoryController {
	constructor(private categoryService: CategoryService) {}

	@Get()
	async findAll() {
		return this.categoryService.findAll()
	}

	@Get(':id')
	async findOne(@Param('id') id:string) {
		return this.categoryService.findOne(id)
	}

	@Post()
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async create(@Body() createCategoryDto:CreateCategoryDto) {
		return this.categoryService.create(createCategoryDto)
	}

	@Patch(':id')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async update(@Param('id') id:string, @Body() updateCategoryDto:UpdateCategoryDto) {
		return this.categoryService.update(id, updateCategoryDto)
	}

	@Delete(':id')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async delete(@Param('id') id:string) {
		return this.categoryService.delete(id)
	}
}