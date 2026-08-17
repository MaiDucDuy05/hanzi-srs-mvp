import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigCacheService } from './config-cache.service';
import { Role } from '../../common/enums/user.enums';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly configCache: ConfigCacheService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const maintenanceMode = await this.configCache.get('maintenance_mode');
    
    // Only block API routes
    if (maintenanceMode === true && req.path.startsWith('/api')) {
      // Decode JWT token to check if user is Admin
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.cookies?.['access_token'];
      
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded: any = jwt.decode(token);
          if (decoded && decoded.role === Role.ADMIN) {
            isAdmin = true;
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      if (!isAdmin) {
        throw new ServiceUnavailableException('Hệ thống đang bảo trì.');
      }
    }
    
    next();
  }
}
