import React from "react";
import { SanitizedLogChannel } from "../../../lib/@types/db";
import { Alert, Box, Card, CircularProgress, Skeleton, Stack } from "@mui/joy";
import DashboardLogChannel from "./LogItem";
import { toLookup } from "@yokilabs/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { DashboardPageProps } from "../pages";

type State = {
    isLoaded: boolean;
    logs: SanitizedLogChannel[];
};

export default class LogsPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, logs: [] };
    }

    async componentDidMount(): Promise<void> {
        const { serverConfig: { serverId } } = this.props;
        await fetch(`/api/servers/${serverId}/logchannels`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ logs }) => this.setState({ isLoaded: true, logs }))
            .catch((errorResponse) => console.error("Error while fetching data:", errorResponse));
    }

    render() {
        const { serverConfig } = this.props;
        const { isLoaded, logs } = this.state;

        // Still fetching data
        if (!isLoaded)
            return <LogsPageSkeleton />;

        const channelLookup = toLookup(logs, (log) => log.channelId);
        // There is no fetch many channels route on Guilded
        const possibleChannels = Object.keys(channelLookup);

        return (
            <>
                <Alert color="warning" variant="soft" startDecorator={<FontAwesomeIcon icon={faExclamationTriangle}/>}>
                    As of now, fetching all server channels is not possible using Guilded API. As such, creating new log channels or changing channels of log types is not possible.
                </Alert>
                {Object.keys(channelLookup).map((channelId) => {
                    const channelTypeInfos = channelLookup[channelId]!;

                    return (
                        <DashboardLogChannel
                            serverId={serverConfig.serverId}
                            channelId={channelId}
                            serverChannels={possibleChannels}
                            createdAt={channelTypeInfos[0].createdAt}
                            types={channelTypeInfos.map((x) => x.type)}
                            timezone={serverConfig.timezone}
                            />
                    );
                })}
            </>
        );
    }
}

/**
 * The barebones skeleton of the page for when logs page is loading.
 * @returns Logs page skeleton
 */
function LogsPageSkeleton() {
    return (
        <Box sx={{ overflow: "hidden" }}>
            <Skeleton animation="wave" width="100%" height={45} sx={{ position: "initial" }} />
            <LogsPageLogSkeleton />
            <LogsPageLogSkeleton />
            <LogsPageLogSkeleton />
        </Box>
    );
}

function LogsPageLogSkeleton() {
    return (
        <Card sx={{ mt: 4 }}>
            <Stack direction="row" gap={2} alignItems="center">
                <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ position: "initial" }} />
                <Skeleton animation="wave" width={320} height={20} sx={{ position: "initial" }} />
                <Stack direction="row" gap={1}>
                    <Skeleton animation="wave" width={80} height={25} sx={{ position: "initial" }} />
                    <Skeleton animation="wave" width={100} height={25} sx={{ position: "initial" }} />
                </Stack>
            </Stack>
            <Skeleton animation="wave" width={222} height={20} sx={{ position: "initial" }} />
        </Card>
    );
}