// ecommerce_api/src/order/order.module.ts

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { Order } from "./entity/order.entity";
import { OrderItem } from "./entity/order_item.entity";
import { ProductVariant } from "../product/entity/product_variant.entity";
import { PaymentModule } from "../payment/payment.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Order, OrderItem, ProductVariant]), 
        HttpModule, 
        PaymentModule, 
	],
	controllers: [OrderController],
	providers: [OrderService],
})
export class OrderModule { }