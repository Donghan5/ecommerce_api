"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const payment_entity_1 = require("./entity/payment.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
// mock payment service (for now, stripe)
let PaymentService = class PaymentService {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    processPayment(order) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => setTimeout(resolve, 1000));
            const isSuccess = Math.random() > 0.2;
            if (!isSuccess) {
                console.log(`[Mock Payment] Payment failed for Order ID: ${order.id}`);
                throw new common_1.BadRequestException('Payment declined by provider (Mock failure)');
            }
            const mockTransactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const payment = this.paymentRepository.create({
                order: order,
                provider: 'stripe_mock',
                transactionId: mockTransactionId,
                amount: order.totalAmount,
                currency: 'USD',
                status: 'paid',
                idempotencyKey: `ikey_${order.id}`,
            });
            console.log(`[Mock Payment] Payment successful: ${mockTransactionId}`);
            return this.paymentRepository.save(payment);
        });
    }
    getPaymentByUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.paymentRepository.find({
                where: {
                    order: {
                        user: {
                            id: user.id
                        }
                    }
                },
                relations: ['order'],
                order: {
                    createdAt: 'DESC'
                }
            });
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentService);
