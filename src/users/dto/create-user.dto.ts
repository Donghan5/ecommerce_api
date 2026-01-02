import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from "class-validator";

export class CreateUserDto {
	@IsNotEmpty()
	@IsEmail({}, { message: 'Not a valid email' })
	email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(6, { message: 'Password must be at least 6 characters' })
	@MaxLength(32, { message: 'Password must be at most 32 characters' })
	password!: string;

	@IsNotEmpty()
	@IsString()
	firstName!: string;

	@IsNotEmpty()
	@IsString()
	lastName!: string;

	@IsNotEmpty()
	@IsString()
	provider!: string;

	@IsOptional()
	@IsString()
	role!: string;
}
