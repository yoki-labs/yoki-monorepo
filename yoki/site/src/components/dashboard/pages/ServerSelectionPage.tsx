import React from "react";
import { GuildedServer } from "../../../lib/@types/guilded";
import { Avatar, Box, Card, CardContent, CardOverflow, CircularProgress, Stack, Typography } from "@mui/joy";
import Link from "next/link";
import ServerDisplay from "../ServerDisplay";

type Props = {
    servers: GuildedServer[];
};
type State = {
    clicked: boolean;
};

export default class ServerSelectionPage extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { clicked: false };
    }

    onClick() {
        console.log("Clicked");
        this.setState({ clicked: true });
    }

    renderServers() {
        const { servers } = this.props;

        return (
            <>
                <Typography level="h3" sx={{ textAlign: "center" }}>Select a server</Typography>
                <Box sx={{ px: 20, py: 5 }} className="grow h-full overflow-y-auto grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {servers.map((server) =>
                        <Link href={`/dashboard/${server.id}/overview`}>
                            <ServerDisplay server={server} onClick={this.onClick.bind(this)} sx={{ cursor: "pointer", bgcolor: "background.level1", "&:hover": { boxShadow: "md", bgcolor: "background.level2" } }} />
                        </Link>
                    )}
                </Box>
            </>
        );
    }

    renderLoading() {
        return (
            <CircularProgress />
        );
    }

    render() {
        const { clicked } = this.state;

        return (
            <Stack alignItems="center" className="grow basis-0">
                { clicked ? this.renderLoading() : this.renderServers() }
            </Stack>
        )
    }
}