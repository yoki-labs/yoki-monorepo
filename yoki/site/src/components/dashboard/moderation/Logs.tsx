import React from "react";
import { SanitizedLogChannel } from "../../../lib/@types/db";
import { Box, Card, Skeleton, Stack, Typography } from "@mui/joy";
import DashboardLogChannel, { LogItemCreationForm } from "./LogItem";
import { toLookup } from "@yokilabs/utils";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { LogChannelType, RoleType } from "@prisma/client";
import { notifyFetchError } from "../../../utils/errorUtil";
import { GuildedSanitizedChannel } from "../../../lib/@types/guilded";
import { LabsFormFieldOption } from "../../form/form";
import { channelsToSelectionOptions } from "../channels";

type State = {
    isLoaded: boolean;
    logs: SanitizedLogChannel[];
    serverChannels: GuildedSanitizedChannel[];
    error?: { code: string; message: string };
};

export default class LogsPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, logs: [], serverChannels: [] };
    }

    get channelSelectionOptions(): LabsFormFieldOption<string>[] {
        return channelsToSelectionOptions(this.state.serverChannels);
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
            .then(({ logs, serverChannels }) => this.setState({ isLoaded: true, logs, serverChannels }))
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
        const { serverConfig, highestRoleType } = this.props;
        const { error, isLoaded, logs, serverChannels } = this.state;
        const { channelSelectionOptions } = this;

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
        // To reinforce not allowing duplicates
        const existingTypes = logs.map((x) => x.type);

        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography level="h3" gutterBottom>
                        Log channels
                    </Typography>
                    <Typography level="body-sm">Manages what changes to the server or actions should be notified and where.</Typography>
                </Box>
                {highestRoleType === RoleType.ADMIN && (
                    <Card sx={{ mb: 2 }}>
                        <LogItemCreationForm onCreate={this.onLogsUpdate.bind(this)} existingTypes={existingTypes} channelOptions={channelSelectionOptions} />
                    </Card>
                )}
                <Stack sx={{ mb: 4 }} gap={2} direction="column">
                    {Object.keys(channelLookup).map((channelId) => {
                        const channelTypeInfos = channelLookup[channelId]!;

                        return (
                            <DashboardLogChannel
                                key={`logs-page-log-${channelId}`}
                                serverId={serverConfig.serverId}
                                channelId={channelId}
                                serverChannels={serverChannels}
                                channelOptions={channelSelectionOptions}
                                createdAt={channelTypeInfos[0].createdAt}
                                types={channelTypeInfos.map((x) => x.type)}
                                canEdit={highestRoleType === RoleType.ADMIN}
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
            <Box sx={{ mb: 3 }}>
                <Typography level="h4" gutterBottom>
                    <Skeleton animation="wave">Log channels</Skeleton>
                </Typography>
                <Skeleton animation="wave">
                    <Typography level="body-sm">Manages what changes to the server or actions should be notified and where.</Typography>
                </Skeleton>
            </Box>
            <Card>
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
