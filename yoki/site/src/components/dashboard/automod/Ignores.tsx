import React from "react";
import { SanitizedChannelIgnore } from "../../../lib/@types/db";
import { Box, Card, Skeleton, Stack, Typography } from "@mui/joy";
import DashboardChannelIgnore, { ChannelIgnoreCreationForm } from "./IgnoreItem";
import { toLookup } from "@yokilabs/utils";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { ChannelIgnoreType, RoleType } from "@prisma/client";
import { notifyFetchError } from "../../../utils/errorUtil";
import { GuildedSanitizedChannel } from "../../../lib/@types/guilded";
import { LabsFormFieldOption } from "../../form/form";
import { channelsToSelectionOptions } from "../channels";
import { contentIgnoreSelectionList } from "./ignore-util";

type State = {
    isLoaded: boolean;
    items: SanitizedChannelIgnore[];
    serverChannels: GuildedSanitizedChannel[];
    error?: { code: string; message: string };
};

export default class IgnoresPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, items: [], serverChannels: [] };
    }

    get contentTypeSelectionOptions(): LabsFormFieldOption<string>[] {
        return contentIgnoreSelectionList;
    }

    get channelSelectionOptions(): LabsFormFieldOption<string>[] {
        return channelsToSelectionOptions(this.state.serverChannels);
    }

    async componentDidMount(): Promise<void> {
        const {
            serverConfig: { serverId },
        } = this.props;

        return fetch(`/api/servers/${serverId}/ignores`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, serverChannels }) => this.setState({ isLoaded: true, items, serverChannels }))
            .catch(async (errorResponse) => this.onFetchError(errorResponse));
    }

    async onFetchError(errorResponse: Response) {
        const error = await errorResponse.json();

        console.log("Error while fetching ignores data:", error);

        this.setState({ error });
    }

    async onIgnoreUpdate(channelIdOrType: string, types: ChannelIgnoreType[]) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return fetch(`/api/servers/${serverId}/ignores/${channelIdOrType}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ types }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items }) => this.setState({ items }))
            .catch(notifyFetchError.bind(null, "Error while updating log data"));
    }

    render() {
        const { serverConfig, highestRoleType } = this.props;
        const { error, isLoaded, items, serverChannels } = this.state;
        const { contentTypeSelectionOptions, channelSelectionOptions } = this;

        const selectionOptions = contentTypeSelectionOptions
            .concat({ type: "divider", name: "", value: "" })
            .concat(...channelSelectionOptions);

        // Server-side error
        if (error)
            return (
                <PagePlaceholder icon={PagePlaceholderIcon.Unexpected} title={`Error while fetching data (${error.code})`}>
                    {error.message}
                </PagePlaceholder>
            );
        // Still fetching data
        else if (!isLoaded) return <LogsPageSkeleton />;

        const ignoreLookup = toLookup(items, (ignore) => ignore.contentType ?? ignore.channelId!);

        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography level="h4" gutterBottom>
                        Auto-moderation ignoring
                    </Typography>
                    <Typography level="body-sm">
                        Set which type of filtering should be ignored by specified content or specified channels.
                    </Typography>
                </Box>
                {highestRoleType === RoleType.ADMIN && (
                    <Card sx={{ mb: 2 }}>
                        <ChannelIgnoreCreationForm onCreate={this.onIgnoreUpdate.bind(this)} options={selectionOptions} />
                    </Card>
                )}
                <Stack sx={{ mb: 4 }} gap={2} direction="column">
                    {Object.keys(ignoreLookup).map((content) => {
                        const ignoreTypeInfos = ignoreLookup[content]!;

                        return (
                            <DashboardChannelIgnore
                                key={`content-ignore-${content}`}
                                serverId={serverConfig.serverId}
                                channelId={ignoreTypeInfos[0].channelId}
                                contentType={ignoreTypeInfos[0].contentType}
                                serverChannels={serverChannels}
                                selectionOptions={selectionOptions}
                                createdAt={ignoreTypeInfos[0].createdAt}
                                types={ignoreTypeInfos.map((x) => x.type)}
                                canEdit={highestRoleType === RoleType.ADMIN}
                                timezone={serverConfig.timezone}
                                onUpdate={this.onIgnoreUpdate.bind(this, content)}
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
                    <Skeleton animation="wave">Auto-moderation ignoring</Skeleton>
                </Typography>
                <Typography level="body-sm">
                    <Skeleton animation="wave">
                        Set which type of filtering should be ignored by specified content or specified channels.
                    </Skeleton>
                </Typography>
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
