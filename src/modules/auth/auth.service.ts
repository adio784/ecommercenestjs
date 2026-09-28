import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto.js';


@Injectable()
export class AuthService {

    private readonly SALT_ROUNDS = 12;
    
    // Constructor ............................................................
    constructor (
        private readonly prisma: PrismaService,
        private jwtService: JwtService,
    ) {}
        
    // Register function .......................................................
    async register (registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { email, password, firstName, lastName } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    password: false,
                }
            });

            const tokens = await this.generateTokens(user.id, user.email);
            await this.updateRefreshToken(user.id, tokens.refreshToken);

            return {
                ...tokens,
                user,
            }

        } catch (error) {
            
            throw new InternalServerErrorException('Error Occured While Registering User !!!');
        }


    }


    // Generate authentication and refresh tokens...............................
    private async generateTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string}> {
        const payload = { sub: userId, email };
        const refreshId = randomBytes(16).toString('hex');
        const [ accessToken, refreshToken ] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            this.jwtService.signAsync({ ...payload, refreshId }, {expiresIn: '7d'}),
        ]);

        return { accessToken, refreshToken };
    }


    // Update refresh tokens ................................................
    async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await this.prisma.user.update({
            where: {id: userId},
            data: {refreshToken},
        }) 
    }

    // refresh authentication token ..........................................
    async refreshTokens(userId: string): Promise<AuthResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId},
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });

        if (!user) {
            throw new UnauthorizedException('User Not Found !!!')
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            ...tokens,
            user
        };
    }


    // Logout authenticated user using their userID ...............................
    async logout(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null }
        })
    }

    // Login users ..............................................................
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password} = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid Email or Password')
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        }
    }
    
}
