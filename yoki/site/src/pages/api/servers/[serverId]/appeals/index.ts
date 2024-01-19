import { Appeal, AppealStatus, RoleType } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { queryUserIsIncorrect } from "../../../../../utils/routes/body";
import { createServerDataRoute } from "../../../../../utils/routes/servers";

const availableStatuses = [AppealStatus.ACCEPTED, "AWAITING", AppealStatus.DECLINED];

const serverAppealsRoute = createServerDataRoute<Appeal, number>({
	type: "number",
	fetchRoleRequired: RoleType.MOD,
	operationRoleRequired: RoleType.MOD,
	searchFilter(value, search) {
		return value.content?.includes(search);
	},
	async fetchMany(serverId, query) {
		// Invalid status filter
		if (query.status && (typeof query.status !== "string" || !availableStatuses.includes(query.status as string)))
			return null;
		else if (queryUserIsIncorrect(query.user)) return null;

		const status = query.status
			? query.status === "AWAITING"
				? null
				: AppealStatus[query.status as AppealStatus]
			: undefined;
		const user = (query.user || undefined) as string | undefined;

		return await prisma.appeal.findMany({
			where: {
				serverId,
				status,
				creatorId: user,
			},
		});
	},
	deleteMany(serverId, ids) {
		return prisma.appeal.deleteMany({
			where: {
				serverId,
				id: {
					in: ids,
				},
			},
		});
	},
	async fetchUsers(serverId, appeals) {
		const userIds = Array.from(new Set(appeals.map((x) => x.creatorId)));

		return clientRest.post(`/teams/${serverId}/members/detail`, {
			idsForBasicInfo: userIds,
			userIds: [],
		});
	},
});

export default serverAppealsRoute;
