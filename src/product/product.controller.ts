import { Controller, Post, Body, UseGuards, Patch, Param, Delete, NotFoundException} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from '../cart/dto/create-variant.dto';

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Post()
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async create(@Body() createProductDto: CreateProductDto) {
		return this.productService.create(createProductDto);
	}

	@Patch(':id')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
		return this.productService.update(id, updateProductDto);
	}

	@Delete(':id')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async remove(@Param('id') id: string) {
		return this.productService.remove(id);
	}

	@Post(':id/variants')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async createVariant(@Param('id') id: string, @Body() createVariantDto: CreateVariantDto) {
		return this.productService.createVariant(id, createVariantDto);
	}
}