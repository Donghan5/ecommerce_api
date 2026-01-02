import { Controller, Get, Param, Post, Body, UseGuards, ParseUUIDPipe } from "@nestjs/common"
import { UserService } from "./user.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { AuthGuard } from "@nestjs/passport"

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private userService: UserService) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin')
    async findAll() {
        return this.userService.findAll();
    }

    @Get('email/:email')
    async findByEmail(@Param('email') email: string) {
        return this.userService.findByEmail(email);
    }

    @Get(':id/profile')
    async getProfile(@Param('id', ParseUUIDPipe) id: string) { // Reject if not in UUID format using ParseUUIDPipe
        return this.userService.getProfile(id);
    }

    @Get(':id/provider')
    async getUserProvider(@Param('id', ParseUUIDPipe) id: string) {
        return this.userService.getUserProvider(id);
    }

    @Get(':id/addresses')
    async getUserWithAddresses(@Param('id', ParseUUIDPipe) id: string) {
        return this.userService.getUserWithAddresses(id);
    }
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.userService.getProfile(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
}