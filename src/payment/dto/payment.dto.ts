import { IsNotEmpty, IsUUID, IsNumber, Min, IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";
export class PaymentDto {
	@IsNotEmpty()
	@IsUUID('4', { message: 'Invalid order ID' })
	orderId!: string;

	@IsNotEmpty()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	amount!: number;

	@IsNotEmpty()
	@IsString()
	currency!: string;

	@IsNotEmpty()
	@IsString()
	provider!: string;

	@IsNotEmpty()
	@IsString()
	transactionId!: string;

	@IsNotEmpty()
	@IsString()
	status!: string;

	@IsOptional()
	@IsString()
	idempotencyKey!: string;
}
