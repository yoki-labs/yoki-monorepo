import { InviteFilter, RoleType } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { queryUserIsIncorrect } from "../../../../../utils/routes/body";
import { createServerDataRoute } from "../../../../../utils/routes/servers";

const serverInvitesRoute = createServerDataRoute<InviteFilter, number>({
	type: "number",
	fetchRoleRequired: RoleType.MOD,
	operationRoleRequired: RoleType.ADMIN,
	searchFilter(value, search) {
		return value.targetServerId.includes(search);
	},
	async fetchMany(serverId, query) {
		if (queryUserIsIncorrect(query.user)) return null;

		const user = (query.user || undefined) as string | undefined;

		return await prisma.inviteFilter.findMany({
			where: {
				serverId,
				creatorId: user,
			},
		});
	},
	deleteMany(serverId, ids) {
		return prisma.inviteFilter.deleteMany({
			where: {
				serverId,
				id: {
					in: ids,
				},
			},
		});
	},
	async fetchUsers(serverId, invites) {
		const userIds = Array.from(new Set(invites.map((x) => x.creatorId)));

		return clientRest.post(`/teams/${serverId}/members/detail`, {
			idsForBasicInfo: userIds,
			userIds: [],
		});
	},
});

export default serverInvitesRoute;
