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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entity/product.entity");
const product_variant_entity_1 = require("./entity/product_variant.entity");
const inventory_entity_1 = require("../inventory/entity/inventory.entity");
let ProductService = class ProductService {
    constructor(productRepository, productVariantRepository, inventoryRepository, dataSource) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.inventoryRepository = inventoryRepository;
        this.dataSource = dataSource;
    }
    createVariant(productId, createVariantDto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const product = yield this.productRepository.findOne({ where: { id: productId } });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${productId} not found`);
            }
            const queryRunner = this.dataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const variant = queryRunner.manager.create(product_variant_entity_1.ProductVariant, Object.assign(Object.assign({}, createVariantDto), { product, compareAtPrice: (_a = createVariantDto.compareAtPrice) !== null && _a !== void 0 ? _a : createVariantDto.price, attributes: createVariantDto.attributes || {} }));
                const savedVariant = yield queryRunner.manager.save(variant);
                const inventory = queryRunner.manager.create(inventory_entity_1.Inventory, {
                    variant: savedVariant,
                    quantityAvailable: createVariantDto.stock,
                    quantityReserved: 0,
                    warehouseLocation: 'Default Warehouse',
                    lastRestoredAt: new Date(),
                });
                yield queryRunner.manager.save(inventory);
                yield queryRunner.commitTransaction();
                return savedVariant;
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    create(createProductDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = this.productRepository.create(createProductDto);
            return this.productRepository.save(product);
        });
    }
    update(id, updateProductDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.findOne({ where: { id } });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            yield this.productRepository.update(id, updateProductDto);
            return this.productRepository.findOne({ where: { id } });
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.productRepository.delete(id);
            if (result.affected === 0) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            return { message: `Product ${id} successfully deleted` };
        });
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __param(2, (0, typeorm_1.InjectRepository)(inventory_entity_1.Inventory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductService);
