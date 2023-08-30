import { Box, Card, CardContent, Chip, ListItemDecorator, MenuItem, Stack, Typography } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@yokilabs/utils";
import LabsIconWrapper from "../../LabsIconWrapper";
import { LogChannelType } from "@prisma/client";
import LabsOverflowButton from "../../LabsOverflowButton";
import React from "react";
import LabsForm, { LabsFormState } from "../../LabsForm";
import { LabsFormFieldType } from "../../form";

type Props = {
    serverId: string;
    channelId: string;
    serverChannels: string[];
    createdAt: string;
    types: LogChannelType[];
    timezone: string | null;
};
// Edit mode exists instead of putting you right away there because there may be too many Select form fields
// With too many channels and too many types at a time and it can be pretty laggy, especially on lower-end
// Devices. Guilded allows too many channels.
type State = {
    inEditMode: boolean;
};

const typeDisplayNames: Record<LogChannelType, string> = {
    [LogChannelType.all]: "All/The rest",
    [LogChannelType.notifications]: "Yoki notifications",
    [LogChannelType.mod_actions]: "Yoki mod logs",
    [LogChannelType.modmail_logs]: "Yoki Modmail logs",
    [LogChannelType.member_joins]: "Member joins",
    [LogChannelType.member_updates]: "Member nickname changes",
    [LogChannelType.member_roles_updates]: "Member's role changes",
    [LogChannelType.member_leaves]: "Member leaves",
    [LogChannelType.member_bans]: "Member bans",
    [LogChannelType.message_edits]: "Message edits",
    [LogChannelType.message_deletions]: "Message deletions",
    [LogChannelType.topic_edits]: "Forum topic edits",
    [LogChannelType.topic_deletions]: "Forum topic deletions",
    [LogChannelType.topic_locks]: "Forum topic locks/unlocks",
    [LogChannelType.comment_deletions]: "Content comment deletions",
};

const typeOptions = Object.values(LogChannelType).map((type) => ({ value: type, name: typeDisplayNames[type] }));

export default class DashboardLogChannel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { inEditMode: false };
    }

    toggleEditMode(inEditMode: boolean) {
        this.setState({ inEditMode });
    }
    
    LogChannelStaticMode() {
        const { serverId, channelId, types, createdAt, timezone } = this.props;
        
        return (
            <>
                {/* The hashtag icon (kind of useless, but there should be indication that it is a channel), channel ID */}
                <Stack component="header" gap={2} direction="row" alignItems="center">
                    <LabsIconWrapper>
                        <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faHashtag} />
                    </LabsIconWrapper>
                    {/* TODO: Replace it with proper channel name */}
                    <Typography level="h1" fontSize="md" fontWeight="bolder">
                        {channelId}
                    </Typography>
                    <Stack sx={{ flex: "1" }} direction="row" gap={1} alignItems="center">
                        {types.map((type) => <Chip variant="outlined">{typeDisplayNames[type]}</Chip>)}
                    </Stack>
                    <LabsOverflowButton variant="outlined" id={`logs-${serverId}-${channelId}`}>
                        <MenuItem onClick={() => this.toggleEditMode(true)}>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faPen} />
                            </ListItemDecorator>
                            Edit log channel
                        </MenuItem>
                        <MenuItem color="danger">
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faTrash} />
                            </ListItemDecorator>
                            Delete log channel
                        </MenuItem>
                    </LabsOverflowButton>
                </Stack>
                <CardContent>
                    <Box sx={{ mt: 0.5 }}>
                        {/* Additional info, such as its creation date */}
                        <Typography level="body-md">
                            {formatDate(new Date(createdAt), timezone)}
                        </Typography>
                    </Box>
                </CardContent>
            </>
        );
    }

    LogChannelEditMode() {
        const { serverChannels, channelId, types, createdAt, timezone } = this.props;
        const onSubmit = this.onLogChannelEdit.bind(this);

        return (
            <LabsForm
                sections={[
                    {
                        row: true,
                        start: (
                            <LabsIconWrapper>
                                <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faHashtag} />
                            </LabsIconWrapper>
                        ),
                        fields: [
                            {
                                type: LabsFormFieldType.Select,
                                prop: "channelId",
                                defaultValue: channelId,
                                selectableValues: serverChannels.map((chatChannelId) => ({
                                    name: chatChannelId,
                                    value: chatChannelId,
                                    icon: faHashtag,
                                }))
                            },
                            {
                                type: LabsFormFieldType.MultiSelect,
                                prop: "type",
                                selectableValues: typeOptions,
                                defaultValue: types,
                                placeholder: "Select log types"
                            }
                        ],
                    },
                    {
                        description: formatDate(new Date(createdAt), timezone),
                        fields: []
                    }
                ]}
                onSubmit={onSubmit}
                onCancel={() => this.toggleEditMode(false)}
            />
        );
    }

    onLogChannelEdit(state: LabsFormState) {
        this.toggleEditMode(false);
    }

    render() {
        const { inEditMode } = this.state;
        const LogChannelStaticMode = this.LogChannelStaticMode.bind(this);
        const LogChannelEditMode = this.LogChannelEditMode.bind(this);

        return (
            <Card>
                { inEditMode ? <LogChannelEditMode /> : <LogChannelStaticMode /> }
            </Card>
        )
    }
}