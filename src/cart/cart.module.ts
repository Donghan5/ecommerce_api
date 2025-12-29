import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart_item.entity';
import { ProductVariant } from '../product/entity/product_variant.entity';
import { Inventory } from '../inventory/entity/inventory.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Cart, CartItem, ProductVariant, Inventory])],
	controllers: [CartController],
	providers: [CartService],
	exports: [CartService],
})
export class CartModule { }
