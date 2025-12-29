import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Inventory } from '../inventory/entity/inventory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductVariant } from './entity/product_variant.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Product, ProductVariant, Inventory])],
	providers: [ProductService],
	controllers: [ProductController],
})
export class ProductModule { }