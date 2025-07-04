import React from "react";
import { GuildedClientServer } from "../../../lib/@types/guilded";
import { AspectRatio, Box, Card, CardContent, CardOverflow, Input, Skeleton, Stack, Typography } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import ServerDisplay from "../ServerDisplay";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import Link from "next/link";

type Props = {};
type State = {
    typingTimeout?: NodeJS.Timeout;
    servers: GuildedClientServer[];
    search: string;
    awaitingResults: boolean;
};

export default class ServerSearch extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            search: "",
            servers: [],
            awaitingResults: false,
        };
    }

    async onChange(search: string) {
        const previousTimeout = this.state.typingTimeout;

        // To not spam Guilded with requests
        if (previousTimeout) clearTimeout(previousTimeout);

        if (search === "") return this.setState({ search, servers: [] });

        const waitForTypingTimeout = setTimeout(async () => this.setState({ awaitingResults: false, servers: await ServerSearch.fetchSearchedServers(search) }), 1000);

        this.setState({ awaitingResults: true, servers: [], search, typingTimeout: waitForTypingTimeout });
    }

    static async fetchSearchedServers(search: string): Promise<GuildedClientServer[]> {
        console.log("Calling with search", { search });
        return fetch(`/api/user/servers/search`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ search }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then((results) => results.servers);
    }

    render() {
        const { awaitingResults, search, servers } = this.state;

        return (
            <Box sx={{ width: "100%", height: "100%" }}>
                <Box className="px-5 py-4 mb-10 md:px-32 lg:px-96">
                    <Input
                        placeholder={"Search for servers"}
                        value={search}
                        variant="soft"
                        onChange={({ target }) => this.onChange(target.value)}
                        startDecorator={<FontAwesomeIcon icon={faSearch} />}
                    />
                </Box>
                {search ? (
                    <Box className="grow h-full overflow-y-auto px-5 md:px-32 lg:px-60" sx={{ pb: 8 }}>
                        <Typography level="title-md" sx={{ mb: 3 }}>
                            {awaitingResults ? (
                                <Skeleton animation="wave" sx={{ mb: 3 }}>
                                    X servers found while searching for "search"
                                </Skeleton>
                            ) : (
                                <>
                                    {servers.length} server{"s".repeat(Number(servers.length !== 1))} found while searching for{" "}
                                    <Typography level="code" sx={{ bgcolor: "background.level1" }}>
                                        {search}
                                    </Typography>
                                </>
                            )}
                        </Typography>
                        <Box className="grid mb-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {awaitingResults ? (
                                <ServerSearchAwaiting />
                            ) : (
                                servers.map((server) => (
                                    <Link key={server.id} style={{ textDecoration: "none" }} href={`/dashboard/${server.id}/overview`}>
                                        <ServerDisplay
                                            id={server.id}
                                            name={server.name}
                                            avatar={server.profilePicture}
                                            banner={server.homeBannerImageMd}
                                            url={server.subdomain}
                                            sx={{ cursor: "pointer", bgcolor: "background.level1", "&:hover": { boxShadow: "md", bgcolor: "background.level2" } }}
                                        />
                                    </Link>
                                ))
                            )}
                        </Box>
                        <PagePlaceholder icon={PagePlaceholderIcon.NotFound} title="Can't find the server?">
                            Private servers may not show up in the dashboard server list due to restrictions in Guilded. Considering using{" "}
                            <Typography component="span" level="code" sx={{ bgcolor: "background.level1" }}>
                                ?dashboard
                            </Typography>{" "}
                            in the server to open its dashboard.
                        </PagePlaceholder>
                    </Box>
                ) : (
                    <ServerSearchEmpty />
                )}
            </Box>
        );
    }
}

function ServerSearchAwaiting() {
    return (
        <>
            <ServerSearchSkeleton />
            <ServerSearchSkeleton />
            <ServerSearchSkeleton />
            <ServerSearchSkeleton />
            <ServerSearchSkeleton />
            <ServerSearchSkeleton />
        </>
    );
}

function ServerSearchEmpty() {
    return (
        <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Find your server">
            Due to Guilded removing our old ways of displaying the server, it is required that you use
            <Typography component="span" level="code" sx={{ bgcolor: "background.level1" }}>
                ?dashboard
            </Typography>{" "}
            in your server or search it up.
        </PagePlaceholder>
    );
}

function ServerSearchSkeleton() {
    return (
        <Card sx={{ bgcolor: "background.level1", minWidth: 200 }}>
            <CardOverflow>
                <AspectRatio ratio="5">
                    <Box sx={{ height: "100%", bgcolor: "background.level2" }}></Box>
                </AspectRatio>
            </CardOverflow>
            <CardContent>
                <Stack gap={2} direction="row">
                    <Skeleton animation="wave" variant="circular" width={48} height={48} />
                    <Stack direction="column">
                        <Skeleton animation="wave">
                            <Typography component="span" level="title-sm">
                                Loading server
                            </Typography>
                        </Skeleton>
                        <Stack sx={{ mt: 0.25, alignItems: "start", flexGrow: "1" }} spacing={2} direction="row">
                            <Skeleton animation="wave">
                                <Typography level="body-md">/programming</Typography>
                            </Skeleton>
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
