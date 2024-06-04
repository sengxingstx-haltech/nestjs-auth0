import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ManagementClient } from 'auth0';
import axios from 'axios';


@Injectable()
export class AuthService {
  private readonly domain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly audience: string;
  private readonly managementClient: ManagementClient;

  constructor() {
    this.domain = process.env.AUTH0_DOMAIN;
    this.clientId = process.env.AUTH0_CLIENT_ID;
    this.clientSecret = process.env.AUTH0_CLIENT_SECRET;
    this.audience = process.env.AUTH0_AUDIENCE;
    this.managementClient = new ManagementClient({
      domain: this.domain,
      clientId: process.env.AUTH0_CLIENT_ID_M2M,
      clientSecret: process.env.AUTH0_CLIENT_SECRET_M2M,
    });
  }

  async authenticate(username: string, password: string): Promise<any> {
    const url = `https://${this.domain}/oauth/token`;

    try {
      const response = await axios.post(url, {
        grant_type: 'password',
        username,
        password,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: this.audience,
        scope: 'openid',
      });

      return response.data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async logout(accessToken: string): Promise<void> {
    const url = `https://${this.domain}/v2/logout`;
    try {
      await axios.post(url, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'Logout failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkUserExists(username: string): Promise<boolean> {
    try {
      const user = await this.managementClient.usersByEmail.getByEmail({ email: username });
      const userExists = user.data.length > 0;
      return userExists;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error checking user existence',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async register(username: string, password: string): Promise<any> {
    const userExists = await this.checkUserExists(username);
    if (userExists) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User already exists',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const url = `https://${this.domain}/dbconnections/signup`;

    try {
      const response = await axios.post(url, {
        client_id: this.clientId,
        email: username,
        password,
        connection: 'Username-Password-Authentication',
      });

      // Automatically authenticate the user after successful registration
      return this.authenticate(username, password);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.response.data.message || 'Registration failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const url = `https://${this.domain}/oauth/token`;

    try {
      const response = await axios.post(url, {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      });

      return response.data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Invalid refresh token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      await this.managementClient.jobs.verifyEmail({ user_id: email})
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'Failed to resend verification email',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const url = `https://${this.domain}/dbconnections/change_password`;

    try {
      await axios.post(url, {
        client_id: this.clientId,
        email,
        connection: 'Username-Password-Authentication', 
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.response.data.message || 'Failed to send password reset email',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

}
