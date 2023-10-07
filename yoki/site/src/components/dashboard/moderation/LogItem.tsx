import { Box, Card, CardContent, Chip, ListItemDecorator, MenuItem, Stack, Typography } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, faHashtag, faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@yokilabs/utils";
import LabsIconWrapper from "../../LabsIconWrapper";
import { LogChannelType } from "@prisma/client";
import LabsOverflowButton from "../../LabsOverflowButton";
import React from "react";
import LabsForm, { LabsFormFieldValueMap } from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";

type Props = {
    serverId: string;
    channelId: string;
    serverChannels: string[];
    createdAt: string;
    types: LogChannelType[];
    existingTypes: LogChannelType[];
    timezone: string | null;

    onUpdate: (types: LogChannelType[]) => Promise<unknown>;
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
                    <LabsIconWrapper className="hidden md:block">
                        <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faHashtag} />
                    </LabsIconWrapper>
                    {/* TODO: Replace it with proper channel name */}
                    <Typography level="h1" fontSize="md" fontWeight="bolder">
                        {channelId}
                    </Typography>
                    <Stack sx={{ flex: "1" }} direction="row" gap={1} alignItems="center" className="hidden md:flex">
                        {types.map((type) => (
                            <Chip variant="outlined">{typeDisplayNames[type]}</Chip>
                        ))}
                    </Stack>
                    <LabsOverflowButton variant="outlined" id={`logs-${serverId}-${channelId}`}>
                        <MenuItem onClick={() => this.toggleEditMode(true)}>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faPen} />
                            </ListItemDecorator>
                            Edit log channel
                        </MenuItem>
                        <MenuItem color="danger" onClick={() => this.onLogChannelDelete()}>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faTrash} />
                            </ListItemDecorator>
                            Delete log channel
                        </MenuItem>
                    </LabsOverflowButton>
                </Stack>
                <CardContent>
                    <Box sx={{ flex: "1", my: 1 }} className="block md:hidden">
                        {types.map((type) => (
                            <Chip variant="outlined" sx={{ mr: 1 }}>
                                {typeDisplayNames[type]}
                            </Chip>
                        ))}
                    </Box>
                    <Box sx={{ mt: 0.5 }}>
                        {/* Additional info, such as its creation date */}
                        <Typography level="body-md">{formatDate(new Date(createdAt), timezone)}</Typography>
                    </Box>
                </CardContent>
            </>
        );
    }

    LogChannelEditMode() {
        const { serverChannels, channelId, types, existingTypes, createdAt, timezone } = this.props;
        const onSubmit = this.onLogChannelEdit.bind(this);
        const otherUsedTypes = existingTypes.filter((x) => !types.includes(x));

        return (
            <LabsForm
                sections={[
                    {
                        order: LabsFormSectionOrder.Row,
                        start: (
                            <LabsIconWrapper className="hidden md:block">
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
                                })),
                            },
                            {
                                type: LabsFormFieldType.MultiSelect,
                                prop: "types",
                                selectableValues: typeOptions.map((x) => ({ ...x, disabled: otherUsedTypes.includes(x.value) })),
                                defaultValue: types,
                                placeholder: "Select log types",
                            },
                        ],
                    },
                    {
                        hideDivider: true,
                        description: formatDate(new Date(createdAt), timezone),
                        fields: [],
                    },
                ]}
                onSubmit={onSubmit}
                onCancel={() => this.toggleEditMode(false)}
                alwaysDisplayActions
            />
        );
    }

    async onLogChannelEdit({ types, channelId }: LabsFormFieldValueMap) {
        this.toggleEditMode(false);

        return this.props.onUpdate(types as LogChannelType[]);
    }

    async onLogChannelDelete() {
        return this.props.onUpdate([]);
    }

    render() {
        const { inEditMode } = this.state;
        const LogChannelStaticMode = this.LogChannelStaticMode.bind(this);
        const LogChannelEditMode = this.LogChannelEditMode.bind(this);

        return <Card>{inEditMode ? <LogChannelEditMode /> : <LogChannelStaticMode />}</Card>;
    }
}

export function LogItemCreationForm({ existingTypes, onCreate: onCreated }: { existingTypes: LogChannelType[]; onCreate: (channelId: string, types: LogChannelType[]) => Promise<unknown> }) {
    return (
        <LabsForm
            sections={[
                {
                    order: LabsFormSectionOrder.Row,
                    start: (
                        <LabsIconWrapper className="hidden md:block">
                            <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faPlus} />
                        </LabsIconWrapper>
                    ),
                    fields: [
                        {
                            type: LabsFormFieldType.Text,
                            prop: "channelId",
                            placeholder: "Type in the ID of a channel",
                        },
                        {
                            type: LabsFormFieldType.MultiSelect,
                            prop: "types",
                            selectableValues: typeOptions.map((x) => ({ ...x, disabled: existingTypes.includes(x.value) })),
                            placeholder: "Select log types",
                        },
                    ],
                },
            ]}
            onSubmit={({ channelId, types }) => onCreated(channelId as string, types as LogChannelType[])}
            resetOnSubmission
        />
    );
}
