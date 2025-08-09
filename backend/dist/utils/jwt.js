"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
class JWTUtils {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.JWT_SECRET, {
            expiresIn: config_1.config.JWT_ACCESS_EXPIRES_IN,
            issuer: 'pos-system',
            audience: 'pos-users'
        });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.JWT_REFRESH_SECRET, {
            expiresIn: config_1.config.JWT_REFRESH_EXPIRES_IN,
            issuer: 'pos-system',
            audience: 'pos-users'
        });
    }
    static verifyAccessToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET, {
                issuer: 'pos-system',
                audience: 'pos-users'
            });
            return payload;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Access token has expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid access token');
            }
            throw new Error('Token verification failed');
        }
    }
    static verifyRefreshToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, config_1.config.JWT_REFRESH_SECRET, {
                issuer: 'pos-system',
                audience: 'pos-users'
            });
            return payload;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Refresh token has expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            throw new Error('Refresh token verification failed');
        }
    }
    static getTokenFromHeader(authorization) {
        if (!authorization)
            return null;
        const parts = authorization.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        return parts[1];
    }
    static decodeTokenWithoutVerification(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch {
            return null;
        }
    }
}
exports.JWTUtils = JWTUtils;
//# sourceMappingURL=jwt.js.map