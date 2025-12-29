import { Controller, Post, Get, Param, Body, Patch, Delete, Req, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentDto } from "./dto/payment.dto";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

interface RequestWithUser extends Request {
    user: any;
}

@Controller('payment')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
    constructor(private paymentService: PaymentService) { }

	// Getting the payment history
    @Get()
	async getMyPayments(@Req() req: RequestWithUser) {
		return this.paymentService.getPaymentByUser(req.user);
	}
}
