import { User, LoginDto, AuthResponse, CreateUserDto } from '../types';
export declare class AuthService {
    private db;
    constructor();
    login(loginDto: LoginDto): Promise<AuthResponse>;
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    createUser(createUserDto: CreateUserDto): Promise<User>;
    validateUser(userId: string): Promise<User | null>;
    private storeRefreshToken;
    private removeRefreshToken;
    private logAuditEvent;
    cleanupExpiredTokens(): Promise<void>;
}
//# sourceMappingURL=auth.d.ts.map