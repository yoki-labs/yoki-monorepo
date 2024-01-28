import { createUserRoute } from "../../../../utils/routes/users";
import { clientRest } from "../../../../guilded";

const userSearchServerRoute = createUserRoute({
    async POST(req, res, _session, user) {
        const search = req.body.search;

        if (typeof search !== "string")
            return res.status(400).json({ message: "Invalid body property type" });

        const { results: { teams } } = await clientRest.get(`/search?query=${encodeURIComponent(search)}&entityType=team`);

        return res.status(200).json({
            servers: teams,
        });
    },
});

export default userSearchServerRoute;
