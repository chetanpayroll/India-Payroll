import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({
        summary: 'Login with email and password',
        description: '🔓 DEMO MODE: Login with ANY email and ANY password. User will be auto-created if not exists.',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @ApiOperation({
        summary: 'Refresh access token',
        description: 'Get a new access token using refresh token',
    })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired refresh token',
    })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
        return this.authService.refresh(refreshTokenDto.refresh_token);
    }

    @Post('logout')
    @ApiOperation({
        summary: 'Logout',
        description: 'Revoke refresh token',
    })
    @ApiResponse({
        status: 200,
        description: 'Logged out successfully',
    })
    async logout(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.logout(refreshTokenDto.refresh_token);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get current user profile',
        description: 'Get authenticated user information',
    })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }
}
