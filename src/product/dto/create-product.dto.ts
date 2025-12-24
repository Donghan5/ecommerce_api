import { IsNotEmpty, IsString, IsUUID, Type, Min, IsNumber } from "class-validator";

export class CreateProductDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	description: string;

	@IsNotEmpty()
	@Type(() => Number)
	@IsNumber()
	@Min(0, { message: 'Base price must be at least 0' })
	basePrice: number;

	@IsNotEmpty()
	@IsUUID('4', { message: 'Invalid UUID form' })
	categoryId: string;
}