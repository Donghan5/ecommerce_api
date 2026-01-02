import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart_item.entity';
import { ProductVariant } from '../product/entity/product_variant.entity';
import { CartItemDto } from './dto/cart-item.dto';
import { BadRequestException } from '@nestjs/common';
import { Inventory } from '../inventory/entity/inventory.entity';

@Injectable()
export class CartService {
	constructor(
		@InjectRepository(Cart)
		private cartRepository: Repository<Cart>,
		@InjectRepository(CartItem)
		private cartItemRepository: Repository<CartItem>,
		@InjectRepository(ProductVariant)
		private productVariantRepository: Repository<ProductVariant>,
		@InjectRepository(Inventory)
		private inventoryRepository: Repository<Inventory>,
	) { }

	async createCart(userId?: string): Promise<Cart> {
		const cart = this.cartRepository.create({
			items: [],
			sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`, // mock session ID
		});
		return this.cartRepository.save(cart);
	}

	async getCart(cartId: string): Promise<Cart> {
		const cart = await this.cartRepository.findOne({
			where: { id: cartId },
			relations: ['items', 'items.variant'],
		});

		if (!cart) {
			throw new NotFoundException(`Cart with ID ${cartId} not found`);
		}

		return cart;
	}

	async addToCart(cartId: string, addToCartDto: CartItemDto): Promise<Cart> {
		const { variantId, quantity } = addToCartDto;

		const cart = await this.getCart(cartId);
		const variant = await this.productVariantRepository.findOne({ where: { id: variantId } });

		if (!variant) {
			throw new NotFoundException(`Product Variant with ID ${variantId} not found`);
		}

		const inventory = await this.inventoryRepository.findOne({
			where: { variant: { id: variantId }}
		});

		if (!inventory) {
			throw new NotFoundException(`Inventory with variant ID ${variantId} not found`);
		}

		let cartItem = await this.cartItemRepository.findOne({
			where: {
				cart: { id: cartId },
				variant: { id: variantId },
			},
		});

		const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
		const totalRequestedQuantity = currentQuantityInCart + quantity;

		if (totalRequestedQuantity > inventory.quantityAvailable) {
			throw new BadRequestException(`Not enough stock for variant ${variantId} (requested: ${totalRequestedQuantity}, available: ${inventory.quantityAvailable})`);
		}

		if (cartItem) {
			// Update quantity
			cartItem.quantity += quantity;
		} else {
			// Create new item
			cartItem = this.cartItemRepository.create({
				cart,
				variant,
				quantity,
			});
		}

		await this.cartItemRepository.save(cartItem);

		return this.getCart(cartId);
	}

	async removeFromCart(cartId: string, variantId: string): Promise<Cart> {
		const cartItem = await this.cartItemRepository.findOne({
			where: {
				cart: { id: cartId },
				variant: { id: variantId },
			},
		});

		if (cartItem) {
			await this.cartItemRepository.remove(cartItem);
		}

		return this.getCart(cartId);
	}

	async getCartItemQuantity(cartId: string, variantId: string): Promise<number> {
		const cartItem = await this.cartItemRepository.findOne({
			where: {
				cart: { id: cartId },
				variant: { id: variantId },
			},
		});

		return cartItem ? cartItem.quantity : 0;
	}
}
