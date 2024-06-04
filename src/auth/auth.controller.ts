import { Controller, Get, Post, Body, Param, Delete, Request, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('username') username: string, @Body('password') password: string) {
    return this.authService.authenticate(username, password);
  }

  @Post('logout')
  async logout(@Headers('Authorization') authHeader: string) {
    const token = authHeader.split(' ')[1];
    return this.authService.logout(token);
  }

  @Post('register')
  async register(@Body('username') username: string, @Body('password') password: string) {
    return this.authService.register(username, password);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('send-password-reset-email')
  async sendPasswordResetEmail(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post('resend-verification')
  async resendVerification(@Body('user_id') userId: string) {
    await this.authService.resendVerificationEmail(userId);
    return { message: 'Verification email resent' };
  }
}
