import { IsNotEmpty, IsString } from "class-validator";

export class CreateAddressDto {
	@IsNotEmpty()
	@IsString()
	addressLine1: string;

	@IsOptional()
	@IsString()
	addressLine2?: string;

	@IsNotEmpty()
	@IsString()
	city: string;

	@IsNotEmpty()
	@IsString()
	postalCode: string;

	@IsNotEmpty()
	@IsString()
	country: string;

	@IsOptional()
	@IsBoolean()
	isDefault?: boolean;
}