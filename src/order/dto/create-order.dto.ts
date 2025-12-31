import { IsArray, ValidateNested, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { CartItemDto } from "../../cart/dto/cart-item.dto";

export class CreateOrderDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CartItemDto)
	items!: CartItemDto[];

	@IsOptional()
	@IsString()
	shippingAddress?: Record<string, any>;	
}