import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'demo@payrollnexus.com',
        description: 'User email address (can be any email)',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'anything',
        description: 'Password (can be any value in demo mode)',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    password: string;
}

export class RefreshTokenDto {
    @ApiProperty({
        description: 'Refresh token',
    })
    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}

export class AuthResponseDto {
    @ApiProperty()
    access_token: string;

    @ApiProperty()
    refresh_token: string;

    @ApiProperty()
    expires_in: number;

    @ApiProperty()
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        vendorId: string | null;
        clientId: string | null;
    };
}
