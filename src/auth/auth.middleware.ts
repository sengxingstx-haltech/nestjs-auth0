import { CanActivate, ExecutionContext, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { jwtDecode } from "jwt-decode";


interface RBACConfig {
  roles: string[];
  permissions?: string[];
}

@Injectable()
export class RBACMiddleware implements CanActivate {
  constructor(private readonly rbacConfig: RBACConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Unauthorized: No token provided');
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const userRoles: string[] = decodedToken['https://hal-pay.com/roles']; // Extract user roles from token payload
      const userPermissions: string[] = decodedToken.permissions || []; // Extract user permissions from token payload (if present)

      // Check if the user has any of the required roles to access the resource
      const hasRequiredRole = this.rbacConfig.roles.some(role => userRoles.includes(role));
      if (!hasRequiredRole) {
        throw new UnauthorizedException('Insufficient privileges');
      }

      // Check if permissions are provided in the RBAC config
      if (this.rbacConfig.permissions) {
        // Check if the user has any of the required permissions to access the resource
        const hasRequiredPermission = this.rbacConfig.permissions.some(permission => userPermissions.includes(permission));
        if (!hasRequiredPermission) {
          throw new UnauthorizedException('Insufficient privileges');
        }
      }

      return true;
    } catch (error) {
      console.error('Error decoding token: ', error);
      throw new UnauthorizedException('Unauthorized: Invalid token');
    }
  }
}