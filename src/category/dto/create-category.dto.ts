import { IsNotEmpty, IsOptional, IsString, IsUUID, IsInt, Min } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
	@IsString()
    name!: string;

	@IsOptional()
	@IsUUID(4, { message: 'parent category must be uuid' })
    parentId?: string;

	@IsOptional()
	@IsString()
	slug?: string;

	@IsOptional()
	@IsInt({ message: 'display order must be integer' })
	@Min(0, { message: 'display order must be greater than or equal to 0' })
	displayOrder?: number;

	@IsOptional()
	@IsString()
	description?: string;
}