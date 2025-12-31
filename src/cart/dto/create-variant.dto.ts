import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsJSON } from "class-validator";
import { Type } from "class-transformer";

export class CreateVariantDto {
	@IsNotEmpty()
	@IsString()
	name!: string;

	@IsNotEmpty()
	@IsString()
	sku!: string;

	@IsNotEmpty()
	@Type(() => Number)
	@IsNumber()
	@Min(0, { message: 'Price must be greater than or equal to 0' })
	price!: number;

	@IsNotEmpty()
	@Type(() => Number)
	@IsNumber()
	@Min(0, { message: 'Stock must be greater than or equal to 0' })
	stock!: number;

	@IsNotEmpty()
	@Type(() => Number)
	@Min(0, { message: 'Compare at price must be greater than or equal to 0' })
	@IsNumber()
	compareAtPrice!: number;

	@IsOptional()
	attributes?: Record<string, any>;
}
