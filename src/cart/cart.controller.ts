import { Controller, Post, Body, Param, Delete, Get } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from './dto/cart-item.dto';

@Controller('carts')
export class CartController {
	constructor(private readonly cartService: CartService) { }

	@Get(':cartId')
	async getCart(@Param('cartId') cartId: string) {
		return this.cartService.getCart(cartId);
	}

	@Post(':cartId/items')
	async addToCart(
		@Param('cartId') cartId: string,
		@Body() cartItemDto: CartItemDto,
	) {
		return this.cartService.addToCart(cartId, cartItemDto);
	}

	@Delete(':cartId/items/:variantId')
	async removeFromCart(
		@Param('cartId') cartId: string,
		@Param('variantId') variantId: string,
	) {
		return this.cartService.removeFromCart(cartId, variantId);
	}
}
