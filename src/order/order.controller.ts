import { Controller, Post, Get, Param, Body, Patch, Delete, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";

interface RequestWithUser extends Request {
    user: any;
}

@Controller('order')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
    constructor(private orderService: OrderService) { }

    @Post()
    async createOrder(@Body() orderDto: CreateOrderDto, @Req() req: RequestWithUser) {
        return this.orderService.createOrder(req.user, orderDto.items);
    }

    @Get()
    async getAllOrders(@Req() req: RequestWithUser) {
        return this.orderService.getAllOrders(req.user);
    }

    @Get(':id')
    async getOrderById(@Param('id') id: string, @Req() req: RequestWithUser) {
        return this.orderService.getOrderById(id, req.user);
    }

    @Patch(':id')
    async updateOrderStatus(
        @Param('id') id: string, 
        @Body() body: { status: string }
    ) {
        return this.orderService.updateOrderStatus(id, body.status);
    }

    @Delete(':id')
    async deleteOrder(@Param('id') id: string) {
        return this.orderService.deleteOrder(id);
    }
}