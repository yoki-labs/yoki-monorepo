import { faCommentDots, faEnvelope, faSmile } from "@fortawesome/free-solid-svg-icons";
import { Box, Card, CardContent, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";
import DataTable from "../../DataTable";
import { SanitizedModmailThread } from "../../../lib/@types/db";
import { ModmailTicketCard, ModmailTicketRow } from "./ModmailItem";
import LabsForm from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { ReactionAction } from "@prisma/client";
import { GuildedSanitizedChannel } from "../../../lib/@types/guilded";
import { channelsToSelectionOptions } from "../channels";

type State = {
    isMounted: boolean;
    reactionAction?: ReactionAction;
    serverChannels: GuildedSanitizedChannel[];
};

export default class ModmailPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isMounted: false, serverChannels: [] };
    }

    componentDidMount(): unknown {
        // To not re-mount
        if (this.state.isMounted) return;

        this.setState({ isMounted: true });

        return this.fetchModmailInfo();
    }

    getTicketsRoute(page: number, search?: string) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/tickets?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchTickets(page: number, search?: string) {
        return fetch(this.getTicketsRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count }) => ({ items, maxPages: Math.ceil(count / 50) }));
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
            .then(({ items, count }) => ({ items, maxPages: Math.ceil(count / 50) }));
    }

    async fetchModmailInfo() {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}/reactions/MODMAIL`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then(errorifyResponseError)
            .then((response) => response.json())
            .then(({ reactionAction, serverChannels }) => this.setState({ reactionAction, serverChannels }))
            .catch(notifyFetchError.bind(null, "Error while updating reaction action data for modmail"));
    }

    async modifyModmailInfo(channelId: string | null | undefined, messageId: string | null | undefined, emoteId: number | null | undefined) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}/reactions/MODMAIL`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ channelId, messageId, emoteId }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while updating reaction action data for modmail"));
    }

    render() {
        const { serverConfig } = this.props;
        const { reactionAction, serverChannels } = this.state;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Modmail"
                        description="Customize how your users interact with your moderators."
                        icon={faEnvelope}
                        activeClassName="from-purple-500 to-blue-500"
                        serverConfig={serverConfig}
                        prop="modmailEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="h4" gutterBottom>
                        Modmail configuration
                    </Typography>
                    <Card>
                        <CardContent>
                            <LabsForm
                                sections={[
                                    {
                                        order: LabsFormSectionOrder.Grid,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Select,
                                                prop: "channelId",
                                                name: "Modmail channel",
                                                description: "The channel that will be used to create modmail ticket threads.",
                                                defaultValue: reactionAction?.channelId,
                                                selectableValues: channelsToSelectionOptions(serverChannels),
                                            },
                                            {
                                                type: LabsFormFieldType.Text,
                                                prop: "messageId",
                                                name: "Modmail trigger message",
                                                description: "The ID of the message that will be used to create modmail threads.",
                                                placeholder: "Message ID",
                                                defaultValue: reactionAction?.messageId,
                                                prefixIcon: faCommentDots,
                                            },
                                            {
                                                type: LabsFormFieldType.Number,
                                                prop: "emoteId",
                                                name: "Modmail trigger emote",
                                                description: "The emote with which users will have to react to create a modmail ticket.",
                                                placeholder: "Emote ID",
                                                defaultValue: reactionAction?.emoteId,
                                                prefixIcon: faSmile,
                                            },
                                        ],
                                    },
                                ]}
                                onSubmit={({ channelId, messageId, emoteId }) => this.modifyModmailInfo(channelId as string | null | undefined, messageId as string | null | undefined, emoteId as number | null | undefined)}
                            />
                        </CardContent>
                    </Card>
                </Box>
                <Stack direction="column" gap={3}>
                    <Typography level="h4">Modmail tickets</Typography>
                    <DataTable<SanitizedModmailThread, string>
                        itemType="tickets"
                        timezone={serverConfig.timezone}
                        columns={["User", "Status", "When"]}
                        getItems={this.fetchTickets.bind(this)}
                        deleteItems={this.deleteTickets.bind(this)}
                        ItemRenderer={ModmailTicketRow}
                        ItemMobileRenderer={ModmailTicketCard}
                    />
                </Stack>
            </>
        );
    }
}
