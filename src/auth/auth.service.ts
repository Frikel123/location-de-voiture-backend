import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);

    const admin = this.adminRepo.create({ email, password: hash });
    return this.adminRepo.save(admin);
  }

  async login(email: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { email } });

    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokenPair(admin);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'SECRET_KEY',
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    if (payload?.type !== 'refresh' || !payload?.sub) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const admin = await this.adminRepo.findOne({ where: { id: payload.sub } });

    if (!admin?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const isCurrentRefreshToken = await bcrypt.compare(refreshToken, admin.refreshTokenHash);

    if (!isCurrentRefreshToken) {
      await this.clearRefreshToken(payload.sub);
      throw new UnauthorizedException(
        'Your access token could not be refreshed because your refresh token was already used.',
      );
    }

    return this.issueTokenPair(admin);
  }

  async logout(adminId?: number) {
    if (adminId) {
      await this.clearRefreshToken(adminId);
    }

    return { success: true };
  }

  private async issueTokenPair(admin: Admin) {
    const payload = { sub: admin.id, id: admin.id, email: admin.email, role: 'admin' };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET ?? 'SECRET_KEY',
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as any,
    });
    const refreshToken = await this.jwtService.signAsync(
      { sub: admin.id, email: admin.email, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'SECRET_KEY',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as any,
      },
    );

    await this.adminRepo.update(admin.id, {
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    });

    return { accessToken, refreshToken, token: accessToken };
  }

  private clearRefreshToken(adminId: number) {
    return this.adminRepo.update(adminId, { refreshTokenHash: null });
  }
}
