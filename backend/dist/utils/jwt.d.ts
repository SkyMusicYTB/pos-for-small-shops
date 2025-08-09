import { TokenPayload } from '../types';
export declare class JWTUtils {
    static generateAccessToken(payload: TokenPayload): string;
    static generateRefreshToken(payload: {
        user_id: string;
    }): string;
    static verifyAccessToken(token: string): TokenPayload;
    static verifyRefreshToken(token: string): {
        user_id: string;
    };
    static getTokenFromHeader(authorization?: string): string | null;
    static decodeTokenWithoutVerification(token: string): any;
}
//# sourceMappingURL=jwt.d.ts.map