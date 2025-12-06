import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/core/database/prisma.service';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * 🔓 SIMPLIFIED LOGIN - ANY email + ANY password works!
     * Auto-creates user on first login with default role.
     * 
     * ⚠️ FOR DEMO/TESTING ONLY - Implement proper password hashing for production
     */
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        // Find or create user
        let user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                vendor: true,
                client: true,
            },
        });

        if (!user) {
            // AUTO-CREATE user on first login
            const firstName = email.split('@')[0].split('.')[0] || 'User';
            const lastName = email.split('@')[0].split('.')[1] || '';

            user = await this.prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    passwordHash: 'demo-mode-no-validation',
                    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
                    lastName: lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1) : '',
                    displayName: email.split('@')[0],
                    role: 'VENDOR_EMPLOYEE', // Default role
                    status: 'ACTIVE',
                },
                include: {
                    vendor: true,
                    client: true,
                },
            });

            console.log(`🆕 Auto-created user: ${email} with role: ${user.role}`);
        }

        // ⚠️ DEMO MODE: Skip password validation
        // In production: await bcrypt.compare(password, user.passwordHash)

        // Check user status
        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Account is not active');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                failedLoginAttempts: 0,
            },
        });

        // Generate JWT access token
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            vendorId: user.vendorId,
            clientId: user.clientId,
        };

        const accessToken = this.jwtService.sign(payload);

        // Generate refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30 days

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: refreshExpiresAt,
            },
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600, // 1 hour
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                vendorId: user.vendorId,
                clientId: user.clientId,
            },
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refresh(refreshToken: string): Promise<AuthResponseDto> {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (tokenRecord.revokedAt) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (new Date() > tokenRecord.expiresAt) {
            throw new UnauthorizedException('Refresh token has expired');
        }

        const user = tokenRecord.user;

        // Generate new access token
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            vendorId: user.vendorId,
            clientId: user.clientId,
        };

        const accessToken = this.jwtService.sign(payload);

        // Optionally rotate refresh token
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30);

        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: {
                revokedAt: new Date(),
                revokedReason: 'Rotated',
            },
        });

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: newRefreshToken,
                expiresAt: refreshExpiresAt,
            },
        });

        return {
            access_token: accessToken,
            refresh_token: newRefreshToken,
            expires_in: 3600,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                vendorId: user.vendorId,
                clientId: user.clientId,
            },
        };
    }

    /**
     * Logout - revoke refresh token
     */
    async logout(refreshToken: string): Promise<{ message: string }> {
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: {
                revokedAt: new Date(),
                revokedReason: 'User logout',
            },
        });

        return { message: 'Logged out successfully' };
    }

    /**
     * Get current user profile
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true,
                role: true,
                vendorId: true,
                clientId: true,
                employeeId: true,
                phone: true,
                avatarUrl: true,
                permissions: true,
                assignedClientIds: true,
                timezone: true,
                locale: true,
                preferences: true,
                status: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    /**
     * Validate user from JWT payload
     */
    async validateUser(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Invalid user');
        }

        return user;
    }
}
