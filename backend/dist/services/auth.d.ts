import { User, LoginDto, RegisterDto } from '../types';
export declare class AuthService {
    private db;
    constructor();
    login(credentials: LoginDto): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
    }>;
    register(userData: RegisterDto): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    private generateAccessToken;
    private generateRefreshToken;
    private updateLastLogin;
    private storeRefreshToken;
    private validateRefreshToken;
    private invalidateRefreshToken;
    private logAuditEvent;
    private cleanupExpiredTokens;
}
//# sourceMappingURL=auth.d.ts.map