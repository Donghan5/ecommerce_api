import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entity/category.entity";
import { HttpModule } from "@nestjs/axios";

@Module({
	imports: [TypeOrmModule.forFeature([Category]), HttpModule],
	controllers: [CategoryController],
	providers: [CategoryService],
	exports: [CategoryService],
})
export class CategoryModule { }
