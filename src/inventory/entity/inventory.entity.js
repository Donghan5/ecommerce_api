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
exports.Inventory = void 0;
const typeorm_1 = require("typeorm");
const product_variant_entity_1 = require("../../product/entity/product_variant.entity");
let Inventory = class Inventory {
};
exports.Inventory = Inventory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Inventory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0, name: 'quantity_available' }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { name: 'quantity_reserved' }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityReserved", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100, name: 'warehouse_location' }),
    __metadata("design:type", String)
], Inventory.prototype, "warehouseLocation", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { name: 'last_restored_at' }),
    __metadata("design:type", Date)
], Inventory.prototype, "lastRestoredAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_variant_entity_1.ProductVariant, (variant) => variant.inventories),
    (0, typeorm_1.JoinColumn)({ name: 'variant_id' }),
    __metadata("design:type", product_variant_entity_1.ProductVariant)
], Inventory.prototype, "variant", void 0);
exports.Inventory = Inventory = __decorate([
    (0, typeorm_1.Entity)('inventories')
], Inventory);
