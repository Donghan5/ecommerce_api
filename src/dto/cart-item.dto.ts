import { IsInt, IsNotEmpty, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class CartItemDto {
    @IsNotEmpty()
    @IsUUID('4', { message: '유효한 UUID 형식이 아닙니다.' })
    variantId: string;

    @IsNotEmpty()
    @IsInt({ message: '수량은 정수여야 합니다.' })
    @Min(1, { message: '수량은 최소 1개 이상이어야 합니다.' })
    @Type(() => Number)
    quantity: number;
}