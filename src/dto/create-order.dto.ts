import { IsArray, ValidateNested, Type, IsOptional, IsString } from "class-validator";
import { CartItemDto } from "./cart-item.dto";

class CreateOrderDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CartItemDto)
	items: CartItemDto[];

	@IsOptional()
	@IsString()
	shippingAddress?: Record<string, any>;	
}