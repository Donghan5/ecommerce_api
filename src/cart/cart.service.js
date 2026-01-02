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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./entity/cart.entity");
const cart_item_entity_1 = require("./entity/cart_item.entity");
const product_variant_entity_1 = require("../product/entity/product_variant.entity");
const common_2 = require("@nestjs/common");
const inventory_entity_1 = require("../inventory/entity/inventory.entity");
let CartService = class CartService {
    constructor(cartRepository, cartItemRepository, productVariantRepository, inventoryRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.inventoryRepository = inventoryRepository;
    }
    createCart(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = this.cartRepository.create({
                items: [],
                sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`, // mock session ID
            });
            return this.cartRepository.save(cart);
        });
    }
    getCart(cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield this.cartRepository.findOne({
                where: { id: cartId },
                relations: ['items', 'items.variant'],
            });
            if (!cart) {
                throw new common_1.NotFoundException(`Cart with ID ${cartId} not found`);
            }
            return cart;
        });
    }
    addToCart(cartId, addToCartDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { variantId, quantity } = addToCartDto;
            const cart = yield this.getCart(cartId);
            const variant = yield this.productVariantRepository.findOne({ where: { id: variantId } });
            if (!variant) {
                throw new common_1.NotFoundException(`Product Variant with ID ${variantId} not found`);
            }
            const inventory = yield this.inventoryRepository.findOne({
                where: { variant: { id: variantId } }
            });
            if (!inventory) {
                throw new common_1.NotFoundException(`Inventory with variant ID ${variantId} not found`);
            }
            let cartItem = yield this.cartItemRepository.findOne({
                where: {
                    cart: { id: cartId },
                    variant: { id: variantId },
                },
            });
            const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
            const totalRequestedQuantity = currentQuantityInCart + quantity;
            if (totalRequestedQuantity > inventory.quantityAvailable) {
                throw new common_2.BadRequestException(`Not enough stock for variant ${variantId} (requested: ${totalRequestedQuantity}, available: ${inventory.quantityAvailable})`);
            }
            if (cartItem) {
                // Update quantity
                cartItem.quantity += quantity;
            }
            else {
                // Create new item
                cartItem = this.cartItemRepository.create({
                    cart,
                    variant,
                    quantity,
                });
            }
            yield this.cartItemRepository.save(cartItem);
            return this.getCart(cartId);
        });
    }
    removeFromCart(cartId, variantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cartItem = yield this.cartItemRepository.findOne({
                where: {
                    cart: { id: cartId },
                    variant: { id: variantId },
                },
            });
            if (cartItem) {
                yield this.cartItemRepository.remove(cartItem);
            }
            return this.getCart(cartId);
        });
    }
    getCartItemQuantity(cartId, variantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cartItem = yield this.cartItemRepository.findOne({
                where: {
                    cart: { id: cartId },
                    variant: { id: variantId },
                },
            });
            return cartItem ? cartItem.quantity : 0;
        });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __param(3, (0, typeorm_1.InjectRepository)(inventory_entity_1.Inventory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
