import { faCommentDots, faEnvelope, faLock, faLockOpen, faSmile } from "@fortawesome/free-solid-svg-icons";
import { Box, Card, CardContent, LinearProgress, Skeleton, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";
import DataTable, { querifyDataTableInfo } from "../../DataTable";
import { SanitizedModmailThread } from "../../../lib/@types/db";
import { ModmailTicketCard, ModmailTicketRow } from "./ModmailItem";
import LabsForm, { LabsFormFieldValueMap } from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { ReactionAction, RoleType } from "@prisma/client";
import { GuildedSanitizedChannel } from "../../../lib/@types/guilded";
import { channelsToSelectionOptions } from "../channels";
import { nullUserOptionList, optionifyUserDetails } from "../content";

type State = {
    isMounted: boolean;
    modmailInfoFetched: boolean;
    reactionAction?: ReactionAction;
    serverChannels: GuildedSanitizedChannel[];
};

export default class ModmailPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isMounted: false, modmailInfoFetched: false, serverChannels: [] };
    }

    componentDidMount(): unknown {
        // To not re-mount
        if (this.state.isMounted) return;

        this.setState({ isMounted: true });

        if (this.props.highestRoleType === RoleType.ADMIN) return this.fetchModmailInfo();
    }

    getTicketsRoute(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/tickets?page=${page}${querifyDataTableInfo(search, filter)}`;
    }

    async fetchTickets(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        return fetch(this.getTicketsRoute(page, search, filter), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    async deleteTickets(ids: string[], page: number, search?: string) {
        return fetch(this.getTicketsRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ids }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    async fetchModmailInfo() {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}/reactions/MODMAIL`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then(errorifyResponseError)
            .then((response) => response.json())
            .then(({ reactionAction, serverChannels }) => this.setState({ modmailInfoFetched: true, reactionAction, serverChannels }))
            .catch(notifyFetchError.bind(null, "Error while fetching reaction action data for modmail"));
    }

    async modifyModmailInfo(channelId: string | null | undefined, messageId: string | null | undefined, emoteId: number | null | undefined) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}/reactions/MODMAIL`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ channelId, messageId, emoteId }),
        })
            .then(errorifyResponseError)
            .catch((res) => notifyFetchError("Error while updating reaction action data for modmail", res));
    }

    render() {
        const { serverConfig, highestRoleType } = this.props;
        const { reactionAction, modmailInfoFetched, serverChannels } = this.state;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Modmail"
                        description="Customize how your users interact with your moderators."
                        icon={faEnvelope}
                        activeClassName="from-purple-500 to-blue-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
                        prop="modmailEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                {highestRoleType === RoleType.ADMIN && (
                    <Box>
                        <Typography level="h4" gutterBottom>
                            Modmail configuration
                        </Typography>
                        <Card>
                            <CardContent>
                                {
                                    modmailInfoFetched
                                    ? <LabsForm
                                        id="modmail-config"
                                        sections={[
                                            {
                                                order: LabsFormSectionOrder.Grid,
                                                fields: [
                                                    {
                                                        type: LabsFormFieldType.Select,
                                                        prop: "channelId",
                                                        name: "Channel",
                                                        description: "The channel that will be used to create modmail ticket threads.",
                                                        defaultValue: reactionAction?.channelId,
                                                        selectableValues: channelsToSelectionOptions(serverChannels),
                                                    },
                                                    {
                                                        type: LabsFormFieldType.Text,
                                                        prop: "messageId",
                                                        name: "Trigger message",
                                                        description: "The ID of the message that will be used to create modmail threads.",
                                                        placeholder: "Message ID",
                                                        defaultValue: reactionAction?.messageId,
                                                        prefixIcon: faCommentDots,
                                                    },
                                                    {
                                                        type: LabsFormFieldType.Number,
                                                        prop: "emoteId",
                                                        name: "Reaction emote",
                                                        description: "The reaction emote that will act as a button to create a modmail ticket.",
                                                        placeholder: "Emote ID",
                                                        defaultValue: reactionAction?.emoteId,
                                                        prefixIcon: faSmile,
                                                    },
                                                ],
                                            },
                                        ]}
                                        onSubmit={({ channelId, messageId, emoteId }) =>
                                            this.modifyModmailInfo(channelId as string | null | undefined, messageId as string | null | undefined, emoteId as number | null | undefined)
                                        }
                                    />
                                    : <ModmailInfoCardSkeleton />
                                }
                            </CardContent>
                        </Card>
                    </Box>
                )}
                <Stack direction="column" gap={3}>
                    <Typography level="h4">Modmail tickets</Typography>
                    <DataTable<SanitizedModmailThread, string>
                        itemType="tickets"
                        timezone={serverConfig.timezone}
                        columns={["User", "Status", "When"]}
                        disableOperations={highestRoleType === RoleType.MINIMOD}
                        getItems={this.fetchTickets.bind(this)}
                        deleteItems={this.deleteTickets.bind(this)}
                        ItemRenderer={ModmailTicketRow}
                        ItemMobileRenderer={ModmailTicketCard}
                        getFilterFormFields={(users) => [
                            {
                                type: LabsFormFieldType.Picker,
                                name: "Status",
                                prop: "closed",
                                selectableValues: [
                                    {
                                        name: "Open",
                                        icon: faLockOpen,
                                        value: false,
                                        description: "The ticket is yet to be handled.",
                                    },
                                    {
                                        name: "Closed",
                                        icon: faLock,
                                        value: true,
                                        description: "The ticket has been handled.",
                                    },
                                ],
                                optional: true,
                                rightSideCheck: true,
                            },
                            {
                                type: LabsFormFieldType.Picker,
                                name: "User",
                                prop: "user",
                                selectableValues: users ? optionifyUserDetails(Object.values(users)) : nullUserOptionList,
                                optional: true,
                                rightSideCheck: true,
                                height: 250,
                            },
                        ]}
                    />
                </Stack>
            </>
        );
    }
}

function ModmailInfoCardSkeleton() {
    return (
        <Stack gap={2} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xlg:grid-cols-4">
            <Box>
                <Typography level="title-md" sx={{ mb: 1 }}>
                    <Skeleton animation="wave">Channel</Skeleton>
                </Typography>
                <Skeleton animation="wave" height={28 + 6} />
                <Typography level="body-sm" sx={{ mt: 1 }}>
                    <Skeleton animation="wave">The channel that will be used to create modmail ticket threads.</Skeleton>
                </Typography>
            </Box>
            <Box>
                <Typography level="title-md" sx={{ mb: 1 }}>
                    <Skeleton animation="wave">Trigger message</Skeleton>
                </Typography>
                <Skeleton animation="wave" height={28 + 6} />
                <Typography level="body-sm" sx={{ mt: 1 }}>
                    <Skeleton animation="wave">The ID of the message that will be used to create modmail threads.</Skeleton>
                </Typography>
            </Box>
            <Box>
                <Typography level="title-md" sx={{ mb: 1 }}>
                    <Skeleton animation="wave">Reaction emote</Skeleton>
                </Typography>
                <Skeleton animation="wave" height={28 + 6} />
                <Typography level="body-sm" sx={{ mt: 1 }}>
                    <Skeleton animation="wave">The reaction emote that will act as a button to create a modmail ticket.</Skeleton>
                </Typography>
            </Box>
        </Stack>
    )
}