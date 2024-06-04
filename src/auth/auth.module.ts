import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';


@Module({
  imports: [
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  // Export AuthService. it makes it available for dependency injection in other modules
  exports: [AuthService],
})
export class AuthModule {}
