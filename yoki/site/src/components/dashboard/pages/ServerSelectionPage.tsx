import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/joy";
import Link from "next/link";
import React from "react";

import { GuildedClientServer } from "../../../lib/@types/guilded";
import ServerDisplay from "../ServerDisplay";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

interface Props {
    servers: GuildedClientServer[];
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
        // const servers = this.props.servers.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
        const servers: GuildedClientServer[] = [];

        return (
            <>
                <Alert variant="soft" color="danger" startDecorator={<FontAwesomeIcon icon={faExclamationCircle} />}>
                    Authlink can no longer fetch servers that user is in. As such, it's recommended to use
                    <Typography component="span" level="code">
                        ?dashboard
                    </Typography>
                    command in the server that you want to use dashboard of.
                </Alert>
                {servers.length && (
                    <Typography level="h3" color="neutral" sx={{ textAlign: "center", mb: 4 }}>
                        Select a server
                    </Typography>
                )}
                <Box className="grow h-full overflow-y-auto px-5 md:px-40" sx={{ pb: 8 }}>
                    <Box className="grid mb-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {servers.map((server) => (
                            <Link key={server.id} style={{ textDecoration: "none" }} href={`/dashboard/${server.id}/overview`}>
                                <ServerDisplay
                                    name={server.name}
                                    avatar={server.profilePicture}
                                    banner={server.teamDashImage}
                                    url={server.subdomain}
                                    onClick={this.onClick.bind(this)}
                                    sx={{ cursor: "pointer", bgcolor: "background.level1", "&:hover": { boxShadow: "md", bgcolor: "background.level2" } }}
                                />
                            </Link>
                        ))}
                    </Box>
                    <PagePlaceholder icon={PagePlaceholderIcon.Unexpected} title="Can't find the server">
                        Private servers may not show up in the dashboard server list due to restrictions in Guilded. Considering using{" "}
                        <Typography component="span" level="code">
                            ?dashboard
                        </Typography>{" "}
                        in the server to open its dashboard.
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
