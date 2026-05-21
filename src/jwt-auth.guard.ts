import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (process.env.VITE_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true') {
      const request = context.switchToHttp().getRequest();
      request.user = {
        id: 'demo-admin',
        sub: 'demo-admin',
        email: 'demo@nayscar.ma',
        role: 'admin',
      };
      return true;
    }

    return super.canActivate(context);
  }
}
