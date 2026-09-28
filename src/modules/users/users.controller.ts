import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UsersService } from './users.service.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import  type{ RequestWithUser } from '../../common/interfaces/request-with-user.interface.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { Role } from '../../generated/prisma/enums.js';

@ApiTags('users')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}



    // Get current user profile
    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Current user profile', type: UserResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@Req() req: RequestWithUser): Promise<UserResponseDto> {
        return this.usersService.findOne(req.user.id);
    }



    // Get all users (for admin only)
    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all users (for admin only)' })
    @ApiResponse({ status: 200, description: 'List of all users', type: [UserResponseDto] })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getAllUsers(): Promise<UserResponseDto[]> {
        return this.usersService.findAll();
    }


    // Get user by ID (for admin only)
    @Get(':id')
    @Roles(Role.ADMIN)
    @HttpCode(200)
    @ApiOperation({ summary: 'Get user by ID (for admin only)' })
    @ApiResponse({ status: 200, description: 'User profile', type: UserResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })

    async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
        return this.usersService.findOne(id);
    }


    // Update current user by ID (for admin only)
    @Patch('me')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update current user profiel' })
    @ApiResponse({ status: 200, description: 'User profile', type: UpdateUserDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async updateProfile(userId: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        return this.usersService.update(userId, updateUserDto);
    }


    // Update current user password
    @Patch('me/password')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update current user password' })
    @ApiResponse({ status: 200, description: 'User profile', type: UpdateUserDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })

    async changePassword(@GetUser('id') userId: string, @Body() changePasswordDto: ChangePasswordDto): Promise<{ message: string}> {
        return this.usersService.changePassword(userId, changePasswordDto);
    }


    // Delete current password
    @Delete('me')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete current user profile" })
    @ApiResponse({ status: 200, description: 'User account successfully deleted', type: UpdateUserDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deleteAccount(@GetUser("id") userId: string): Promise<{ message: string }> {
        return await this.usersService.remove(userId);
    }


    // Delete user by ID (for admin only)
    @Delete('id')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete user profile by ID" })
    @ApiResponse({ status: 200, description: 'User account with the specific ID has been successfully deleted', type: UpdateUserDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deleteUser(@Param('id') id: string): Promise<{ message: string}> {
        return await this.usersService.remove(id);
    }


}
