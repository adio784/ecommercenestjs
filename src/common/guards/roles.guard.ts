// Custom auth guards

import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "../../generated/prisma/enums.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";

export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!requireRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requireRoles.some((role) => user.roles === role);
    }
}