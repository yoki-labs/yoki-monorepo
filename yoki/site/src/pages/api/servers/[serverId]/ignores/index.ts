// import { ChannelIgnore } from "@prisma/client";

// import prisma from "../../../../../prisma";
// import { createServerDataRoute } from "../../../../../utils/routes/servers";

// const serverIgnoresRoute = createServerDataRoute<ChannelIgnore, number>({
//     type: "number",
//     searchFilter(value, search) {
//         return value.channelId?.includes(search) || value.contentType?.includes(search.toUpperCase()) || false;
//     },
//     fetchMany(serverId) {
//         return prisma.channelIgnore.findMany({
//             where: {
//                 serverId,
//             },
//         });
//     },
//     deleteMany(serverId, ids) {
//         return prisma.channelIgnore.deleteMany({
//             where: {
//                 serverId,
//                 id: {
//                     in: ids,
//                 },
//             },
//         });
//     },
// });

// export default serverIgnoresRoute;
