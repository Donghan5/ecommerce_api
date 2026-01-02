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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("./order.entity");
let OrderItem = class OrderItem {
};
exports.OrderItem = OrderItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrderItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", order_entity_1.Order)
], OrderItem.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'variant_id' }),
    __metadata("design:type", String)
], OrderItem.prototype, "variantId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, name: 'product_name_snapshot' }),
    __metadata("design:type", String)
], OrderItem.prototype, "productNameSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100, name: 'sku_snapshot' }),
    __metadata("design:type", String)
], OrderItem.prototype, "skuSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 19, scale: 4, name: 'price_snapshot' }),
    __metadata("design:type", Number)
], OrderItem.prototype, "priceSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 19, scale: 4, name: 'total_line_price' }),
    __metadata("design:type", Number)
], OrderItem.prototype, "totalLinePrice", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, typeorm_1.Entity)('order_items')
], OrderItem);
