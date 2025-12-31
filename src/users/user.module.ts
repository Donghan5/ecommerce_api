import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { UserService } from "./user.service";
import { UserAddress } from "./entity/user_addresses.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, UserAddress])
	],
	providers: [UserService],
	exports: [UserService]
})
export class UserModule {}