import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RBACMiddleware } from 'src/auth/auth.middleware';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Get('admin')
  // @UseGuards(new RBACMiddleware({ roles: ['Admin', 'Moderator', 'Admin Manager'], permissions: ['read:hal-pay'] }))
  @UseGuards(new RBACMiddleware({ roles: ['Admin', 'Moderator', 'Admin Manager'] }))
  getAdminContent() {
    return 'This is admin content';
  }

  @Get()
  @UseGuards(new RBACMiddleware({ roles: ['Admin', 'Moderator', 'General Customer'], permissions: ['read:hal-pay'] }))
  getUserContent() {
    return 'This is user content';
  }
}
