import jwt from 'jsonwebtoken';
import { config } from './config';
import { TokenPayload } from '../types';

export class JWTUtils {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
      issuer: 'pos-system',
      audience: 'pos-users'
    } as any);
  }

  static generateRefreshToken(payload: { user_id: string }): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
      issuer: 'pos-system',
      audience: 'pos-users'
    } as any);
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET, {
        issuer: 'pos-system',
        audience: 'pos-users'
      }) as TokenPayload;
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw new Error('Token verification failed');
    }
  }

  static verifyRefreshToken(token: string): { user_id: string } {
    try {
      const payload = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        issuer: 'pos-system',
        audience: 'pos-users'
      }) as { user_id: string };
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw new Error('Refresh token verification failed');
    }
  }

  static getTokenFromHeader(authorization?: string): string | null {
    if (!authorization) return null;
    
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  static decodeTokenWithoutVerification(token: string): any {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }
}