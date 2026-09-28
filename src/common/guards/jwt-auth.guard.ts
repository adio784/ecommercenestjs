// Jwt Auth Guard using the jwt strategy guards
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

export class JwtAuthGuard extends AuthGuard('jwt') {

    constructor(
        private reflector: Reflector
    ){
        super();
    }

    canActivate(context: ExecutionContext){
        return super.canActivate(context);
    }
}