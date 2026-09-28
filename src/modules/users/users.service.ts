import { Injectable, NotFoundException } from '@nestjs/common';
import { UserResponseDto } from './dto/user-response.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import * as bcrypt from'bcrypt';

@Injectable()
export class UsersService {

    private readonly SALT_ROUNDS = 10;
    constructor (private prisma: PrismaService){}


    // Find one user by ID ..............................................
    async findOne(userId: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                password: false
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    // Find all users ...................................................
    async findAll(): Promise<UserResponseDto[]> {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                password: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }


    // update user .....................................................
    async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.email && updateUserDto.email !== existingUser?.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });

            if (emailExists) {
                throw new NotFoundException('Email already in use by another user');
            }
        }

        // Update user profile
        const updateUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                password: false
            }
        });

        return updateUser;
    }


    // Change user password ............................................
    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
        
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found !!!')
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword, user.password
        );

        if (!isPasswordValid) {
            throw new NotFoundException('Current password in incorrent')
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new NotFoundException('New password must be different from the current password')
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS)

        await this.prisma.user.update({
            where: { id: userId },
            data: ({ password: hashedNewPassword})
        });

        return { message: 'Password changed successfully' }
    }


    // Delete current user ..............................................
    async remove(userId: string): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found')
        }

        await this.prisma.user.delete(({
            where: { id: userId }
        }));

        return { message: 'User Account Delete Successfully !!!'}
    }



}
