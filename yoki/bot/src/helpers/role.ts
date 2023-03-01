import { Util } from "./util";

export class RoleUtil extends Util {
    async assignMultipleRoles(serverId: string, userId: string, roles: number[]) {
        const roleRequests: Promise<unknown>[] = [];
        for (const role of roles) {
            roleRequests.push(
                this.client.roles
                    .addRoleToMember(serverId!, userId, role)
                    .then(() => role)
                    .catch(() => {
                        throw role;
                    })
            );
        }
        const responses = await Promise.allSettled(roleRequests);

        return {
            success: responses.filter((x) => x.status === "fulfilled").map((x) => (x as PromiseFulfilledResult<number>).value),
            failed: responses.filter((x) => x.status === "rejected").map((x) => (x as PromiseRejectedResult).reason),
        };
    }

    async removeMultipleRoles(serverId: string, userId: string, roles: number[]) {
        const roleRequests: Promise<unknown>[] = [];
        for (const role of roles) {
            roleRequests.push(
                this.client.roles
                    .removeRoleFromMember(serverId!, userId, role)
                    .then(() => role)
                    .catch(() => {
                        throw role;
                    })
            );
        }
        const responses = await Promise.allSettled(roleRequests);

        return {
            success: responses.filter((x) => x.status === "fulfilled").map((x) => (x as PromiseFulfilledResult<number>).value),
            failed: responses.filter((x) => x.status === "rejected").map((x) => (x as PromiseRejectedResult).reason),
        };
    }
}

export const buildMemberKey = (serverId: string, memberId: string) => `member-${serverId}-${memberId}`;
