import React from "react";
import { SanitizedLogChannel } from "../../../lib/@types/db";
import { Alert, Box, Card, Skeleton, Stack } from "@mui/joy";
import DashboardLogChannel, { LogItemCreationForm } from "./LogItem";
import { toLookup } from "@yokilabs/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { LogChannelType } from "@prisma/client";
import { notifyFetchError } from "../../../utils/errorUtil";

type State = {
    isLoaded: boolean;
    logs: SanitizedLogChannel[];
    error?: { code: string; message: string };
};

export default class LogsPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, logs: [] };
    }

    async componentDidMount(): Promise<void> {
        const {
            serverConfig: { serverId },
        } = this.props;

        return fetch(`/api/servers/${serverId}/logs`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ logs }) => this.setState({ isLoaded: true, logs }))
            .catch(async (errorResponse) => this.onFetchError(errorResponse));
    }

    async onFetchError(errorResponse: Response) {
        const error = await errorResponse.json();

        console.log("Error while fetching logs data:", error);

        this.setState({ error });
    }

    async onLogsUpdate(channelId: string, types: LogChannelType[]) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return fetch(`/api/servers/${serverId}/logs/${channelId}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ types }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ logs }) => this.setState({ logs }))
            .catch(notifyFetchError.bind(null, "Error while updating log data"));
    }

    render() {
        const { serverConfig } = this.props;
        const { error, isLoaded, logs } = this.state;

        // Server-side error
        if (error)
            return (
                <PagePlaceholder icon={PagePlaceholderIcon.Unexpected} title={`Error while fetching data (${error.code})`}>
                    {error.message}
                </PagePlaceholder>
            );
        // Still fetching data
        else if (!isLoaded) return <LogsPageSkeleton />;

        const channelLookup = toLookup(logs, (log) => log.channelId);
        // There is no fetch many channels route on Guilded
        const possibleChannels = Object.keys(channelLookup);
        // To reinforce not allowing duplicates
        const existingTypes = logs.map((x) => x.type);

        return (
            <Box>
                <Alert sx={{ mb: 4 }} color="warning" variant="soft" startDecorator={<FontAwesomeIcon icon={faExclamationTriangle} />}>
                    As of now, fetching all server channels is not possible using Guilded API. As such, as of now, you need to copy & paste channel IDs instead of being able to
                    select channels.
                </Alert>
                <Card sx={{ mb: 2 }}>
                    <LogItemCreationForm
                        onCreate={this.onLogsUpdate.bind(this)}
                        existingTypes={existingTypes}
                    />
                </Card>
                <Stack sx={{ mb: 4 }} gap={2} direction="column">
                    {Object.keys(channelLookup).map((channelId) => {
                        const channelTypeInfos = channelLookup[channelId]!;

                        return (
                            <DashboardLogChannel
                                serverId={serverConfig.serverId}
                                channelId={channelId}
                                serverChannels={possibleChannels}
                                createdAt={channelTypeInfos[0].createdAt}
                                types={channelTypeInfos.map((x) => x.type)}
                                existingTypes={existingTypes}
                                timezone={serverConfig.timezone}
                                onUpdate={this.onLogsUpdate.bind(this, channelId)}
                            />
                        );
                    })}
                </Stack>
            </Box>
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
            <Skeleton animation="wave" width="100%" height={45} />
            <Card sx={{ mt: 4 }}>
                <Stack direction="row" gap={2} alignItems="center">
                    <Skeleton animation="wave" variant="circular" width={40} height={40} />
                    <Skeleton animation="wave" width={242} height={40} />
                    <Skeleton animation="wave" width={178} height={40} />
                </Stack>
            </Card>
            <LogsPageLogSkeleton />
            <LogsPageLogSkeleton />
            <LogsPageLogSkeleton />
        </Box>
    );
}

function LogsPageLogSkeleton() {
    return (
        <Card sx={{ mt: 2 }}>
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
