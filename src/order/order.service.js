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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const order_entity_1 = require("./entity/order.entity");
const order_item_entity_1 = require("./entity/order_item.entity");
const product_variant_entity_1 = require("../product/entity/product_variant.entity");
const payment_service_1 = require("../payment/payment.service");
let OrderService = class OrderService {
    constructor(orderRepository, orderItemRepository, productVariantRepository, httpService, paymentService, dataSource) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.httpService = httpService;
        this.paymentService = paymentService;
        this.dataSource = dataSource;
    }
    createOrder(user, items) {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingOrder = yield this.savePendingOrder(user, items);
            // tracker for reserved items (to rollback in case of failure)
            const reservedItemsTracker = [];
            try {
                yield this.decreaseInventory(items, reservedItemsTracker);
                yield this.processOrder(pendingOrder);
                return yield this.confirmOrder(pendingOrder);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Go Server Inventory Update Failed:', error.message);
                }
                // Compensating Transaction (Roll back)
                yield this.handleOrderFailure(pendingOrder, reservedItemsTracker);
                throw new common_1.BadRequestException('Inventory update failed, order cancelled.');
            }
        });
    }
    // helper function to save pending order
    savePendingOrder(user, items) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const queryRunner = this.dataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const order = new order_entity_1.Order();
                order.user = user;
                order.status = 'pending';
                order.paymentMethod = 'credit_card';
                order.totalAmount = 0;
                order.shippingAddress = ((_a = user.addresses) === null || _a === void 0 ? void 0 : _a[0]) || {};
                const savedOrder = yield queryRunner.manager.save(order);
                let totalAmount = 0;
                for (const item of items) {
                    const variant = yield this.productVariantRepository.findOne({ where: { id: item.variantId } });
                    if (!variant)
                        throw new common_1.NotFoundException(`Variant not found: ${item.variantId}`);
                    const orderItem = new order_item_entity_1.OrderItem();
                    orderItem.order = savedOrder;
                    orderItem.variantId = variant.id;
                    orderItem.quantity = item.quantity;
                    orderItem.productNameSnapshot = variant.name;
                    orderItem.skuSnapshot = variant.sku;
                    orderItem.priceSnapshot = variant.price;
                    orderItem.totalLinePrice = Number(variant.price) * Number(item.quantity);
                    totalAmount += orderItem.totalLinePrice;
                    yield queryRunner.manager.save(orderItem);
                }
                savedOrder.totalAmount = totalAmount;
                yield queryRunner.manager.save(savedOrder);
                yield queryRunner.commitTransaction();
                return savedOrder;
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                throw new common_1.InternalServerErrorException('Failed to create pending order');
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    // helper function to decrease stock
    decreaseInventory(items, reservedItemsTracker) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of items) {
                const url = process.env.GO_ADDRESS + '/inventory/decrease';
                const payload = {
                    variant_id: item.variantId,
                    quantity: item.quantity,
                };
                yield (0, rxjs_1.lastValueFrom)(this.httpService.post(url, payload));
                reservedItemsTracker.push(item);
            }
        });
    }
    processOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.paymentService.processPayment(order);
        });
    }
    confirmOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            order.status = 'confirmed';
            return this.orderRepository.save(order);
        });
    }
    // handle order failure (with rollback transaction)
    handleOrderFailure(order, reservedItemsTracker) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of reservedItemsTracker) {
                try {
                    const url = process.env.GO_ADDRESS + '/inventory/increase';
                    const payload = {
                        variant_id: item.variantId,
                        quantity: item.quantity
                    };
                    yield (0, rxjs_1.lastValueFrom)(this.httpService.post(url, payload));
                    console.log(`Stock resotred for variant ${item.variantId}`);
                }
                catch (rollbackError) {
                    console.error(`Failed to rollback for variant ${item.variantId}:`, rollbackError);
                }
            }
            yield this.orderRepository.delete(order.id);
        });
    }
    // get all orders of specific user
    getAllOrders(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.orderRepository.find({
                where: { user: { id: user.id } },
                relations: ['items'],
                order: { createdAt: 'DESC' }
            });
        });
    }
    // get order by id
    getOrderById(orderId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.findOne({
                where: { id: orderId },
                relations: ['items', 'user'],
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.user.id !== user.id && user.role !== 'admin') {
                throw new common_1.BadRequestException('No right to access this order');
            }
            return order;
        });
    }
    // update order status (pending, confirmed, cancelled)
    updateOrderStatus(orderId, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.findOne({ where: { id: orderId }, relations: ['items'] });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.status === 'shipped' && newStatus === 'cancelled') {
                throw new common_1.BadRequestException('Order cannot be cancelled after it has been shipped or order is already cancelled');
            }
            if (newStatus === 'cancelled' && order.status !== 'cancelled') {
                try {
                    for (const item of order.items) {
                        const url = process.env.GO_ADDRESS + '/inventory/increase';
                        const payload = {
                            variant_id: item.variantId,
                            quantity: item.quantity,
                        };
                        yield (0, rxjs_1.lastValueFrom)(this.httpService.post(url, payload));
                    }
                }
                catch (error) {
                    console.error('Failed to restore stock: ', error);
                }
            }
            order.status = newStatus;
            return this.orderRepository.save(order);
        });
    }
    // delete order
    deleteOrder(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.status === 'shipped') {
                throw new common_1.BadRequestException('Order cannot be deleted after it has been shipped');
            }
            yield this.orderRepository.delete(orderId);
        });
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        axios_1.HttpService,
        payment_service_1.PaymentService,
        typeorm_2.DataSource])
], OrderService);
