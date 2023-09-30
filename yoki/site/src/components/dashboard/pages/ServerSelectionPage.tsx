import { Box, CircularProgress, Stack, Typography } from "@mui/joy";
import Link from "next/link";
import React from "react";

import { GuildedServer } from "../../../lib/@types/guilded";
import ServerDisplay from "../ServerDisplay";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

interface Props {
    servers: GuildedServer[];
}
interface State {
    clicked: boolean;
}

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
        const servers = this.props.servers.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));

        return (
            <>
                <Typography level="h3" color="neutral" sx={{ textAlign: "center" }}>
                    Select a server
                </Typography>
                <Box className="grow h-full overflow-y-auto px-5 py-10 md:px-40 md:py-10" sx={{ mb: 8 }}>
                    <Box className="grid mb-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {servers.map((server) => (
                            <Link key={server.id} style={{ textDecoration: "none" }} href={`/dashboard/${server.id}/overview`}>
                                <ServerDisplay
                                    server={server}
                                    onClick={this.onClick.bind(this)}
                                    sx={{ cursor: "pointer", bgcolor: "background.level1", "&:hover": { boxShadow: "md", bgcolor: "background.level2" } }}
                                />
                            </Link>
                        ))}
                    </Box>
                    <PagePlaceholder icon={PagePlaceholderIcon.Unexpected} title="Can't find the server">
                        Private servers may not show up in the dashboard server list due to restrictions in Guilded. Considering using <Typography component="span" level="code">?dashboard</Typography> in the server to open its dashboard.
                    </PagePlaceholder>
                </Box>
            </>
        );
    }

    renderLoading() {
        return <CircularProgress />;
    }

    render() {
        const { clicked } = this.state;

        return (
            <Stack alignItems="center" className="grow basis-0">
                {clicked ? this.renderLoading() : this.renderServers()}
            </Stack>
        );
    }
}
