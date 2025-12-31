import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>
	) { }

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.userRepository.findOne({ 
			where: { email: email },
		});
		return user;
	}

	async findAll(): Promise<User[]> {
		return this.userRepository.find();
	}

	async getUserWithAddresses(userId: string) {
		const user = this.userRepository.findOne({
			where: { id: userId },
			relations: ['addresses'],
		});
	}

	async getProfile(userId: string) {
		const user = this.userRepository.findOne({
			where: { id: userId },
			select: ['id', 'email', 'firstName', 'lastName'],
		});
	}

	async getUserProvider(userId: string): Promise<string> {
		const user = await this.userRepository.findOne({
			where: { id: userId },
			select: ['provider'],
		});
		// if not found, default to 'local'
		return user?.provider || 'local';
	}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const user = this.userRepository.create(createUserDto);
		return this.userRepository.save(user);
	}
}