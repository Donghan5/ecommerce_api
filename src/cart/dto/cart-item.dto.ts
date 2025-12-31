import { IsInt, IsNotEmpty, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class CartItemDto {
    @IsNotEmpty()
    @IsUUID('4', { message: 'Not vaild UUID.' })
    variantId!: string;

    @IsNotEmpty()
    @IsInt({ message: 'Not vaild integer.' })
    @Min(1, { message: 'Not vaild integer.' })
    @Type(() => Number)
    quantity!: number;
}