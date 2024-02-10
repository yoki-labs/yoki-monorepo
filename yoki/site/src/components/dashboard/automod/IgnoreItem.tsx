import { Box, Card, CardContent, Chip, ListItemDecorator, MenuItem, Stack, Typography } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, faHashtag, faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@yokilabs/utils";
import LabsIconWrapper from "../../LabsIconWrapper";
import { ChannelIgnoreType, ContentIgnoreType, LogChannelType } from "@prisma/client";
import LabsOverflowButton from "../../LabsOverflowButton";
import React from "react";
import LabsForm, { LabsFormFieldValueMap } from "../../form/LabsForm";
import { LabsFormFieldOption, LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { GuildedSanitizedChannel } from "../../../lib/@types/guilded";
import { channelTypeToIcon } from "../channels";
import { channelIgnoreTypeList, contentIgnoreSelectionList } from "./ignore-util";

type Props = {
    serverId: string;

    channelId: string | null;
    contentType: ContentIgnoreType | null;
    types: ChannelIgnoreType[];

    serverChannels: GuildedSanitizedChannel[];
    selectionOptions: LabsFormFieldOption<string>[];
    createdAt: string;
    canEdit: boolean;
    timezone: string | null;

    onUpdate: (types: ChannelIgnoreType[]) => Promise<unknown>;
};
// Edit mode exists instead of putting you right away there because there may be too many Select form fields
// With too many channels and too many types at a time and it can be pretty laggy, especially on lower-end
// Devices. Guilded allows too many channels.
type State = {
    inEditMode: boolean;
};

export default class DashboardChannelIgnore extends React.Component<Props, State> {
    private _serverChannel: GuildedSanitizedChannel | undefined;
    private _icon: IconDefinition;

    constructor(props: Props) {
        super(props);

        this.state = { inEditMode: false };
        this._serverChannel = props.channelId ? props.serverChannels.find((x) => x.id === props.channelId) : undefined;
        this._icon = this._serverChannel?.contentType
            ? channelTypeToIcon[this._serverChannel.contentType as "chat" | "voice" | "stream"]
            : contentIgnoreSelectionList.find((x) => x.value === props.contentType)?.icon ?? faHashtag;
    }

    toggleEditMode(inEditMode: boolean) {
        this.setState({ inEditMode });
    }

    ChannelIgnoreStaticMode() {
        const { serverId, channelId, contentType, canEdit, types, createdAt, timezone } = this.props;

        console.log({ channelId, contentType });

        return (
            <>
                <CardContent>
                    {/* The hashtag icon (kind of useless, but there should be indication that it is a channel), channel ID */}
                    <Stack component="header" gap={2} direction="row" alignItems="center">
                        <LabsIconWrapper className="hidden md:block">
                            <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={this._icon} />
                        </LabsIconWrapper>
                        {/* TODO: Replace it with proper channel name */}
                        <Typography level="h1" fontSize="md" fontWeight="bolder" className="sm:flex-1 md:grow-0 md:shrink-0 md:basis-[auto]">
                            {this._serverChannel?.name ?? channelId ?? contentType}
                        </Typography>
                        <Stack sx={{ flex: "1" }} direction="row" gap={1} alignItems="center" className="hidden md:flex">
                            {types.map((type) => (
                                <Chip variant="outlined" sx={{ fontWeight: "bolder" }}>
                                    {channelIgnoreTypeList.find((x) => x.value === type)?.name}
                                </Chip>
                            ))}
                        </Stack>
                        {canEdit && (
                            <LabsOverflowButton variant="outlined" id={`logs-${serverId}-${channelId}`}>
                                <MenuItem onClick={() => this.toggleEditMode(true)}>
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faPen} />
                                    </ListItemDecorator>
                                    Edit automod ignore
                                </MenuItem>
                                <MenuItem color="danger" onClick={() => this.onChannelIgnoreDelete()}>
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </ListItemDecorator>
                                    Delete automod ignore
                                </MenuItem>
                            </LabsOverflowButton>
                        )}
                    </Stack>
                    <Box sx={{ flex: "1", my: 1 }} className="block md:hidden">
                        {types.map((type) => (
                            <Chip variant="outlined" sx={{ mr: 1 }}>
                                {channelIgnoreTypeList.find((x) => x.value === type)?.name}
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

    ChannelIgnoreEditMode() {
        const { selectionOptions, channelId, contentType, types, createdAt, timezone } = this.props;
        const onSubmit = this.onChannelIgnoreEdit.bind(this);

        return (
            <LabsForm
                id={`channel-ignore-${contentType ?? channelId}`}
                sections={[
                    {
                        order: LabsFormSectionOrder.Row,
                        start: (
                            <LabsIconWrapper className="hidden md:block">
                                <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={this._icon} />
                            </LabsIconWrapper>
                        ),
                        fields: [
                            {
                                type: LabsFormFieldType.Select,
                                prop: "content",
                                defaultValue: contentType ?? channelId,
                                selectableValues: selectionOptions,
                            },
                            {
                                type: LabsFormFieldType.MultiSelect,
                                prop: "type",
                                selectableValues: channelIgnoreTypeList,
                                defaultValue: types,
                                placeholder: "Select ignored",
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

    async onChannelIgnoreEdit({ types }: LabsFormFieldValueMap) {
        this.toggleEditMode(false);

        return this.props.onUpdate(types as ChannelIgnoreType[]);
    }

    async onChannelIgnoreDelete() {
        return this.props.onUpdate([]);
    }

    render() {
        const { inEditMode } = this.state;
        const LogChannelStaticMode = this.ChannelIgnoreStaticMode.bind(this);
        const LogChannelEditMode = this.ChannelIgnoreEditMode.bind(this);

        return <Card>{inEditMode ? <LogChannelEditMode /> : <LogChannelStaticMode />}</Card>;
    }
}

export function ChannelIgnoreCreationForm({
    onCreate: onCreated,
    options,
}: {
    onCreate: (channelId: string, types: ChannelIgnoreType[]) => Promise<unknown>;
    options: LabsFormFieldOption<string>[];
}) {
    return (
        <LabsForm
            id="logs-page-creator"
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
                            type: LabsFormFieldType.Select,
                            prop: "content",
                            placeholder: "Select content or channel",
                            selectableValues: options,
                        },
                        {
                            type: LabsFormFieldType.MultiSelect,
                            prop: "types",
                            selectableValues: channelIgnoreTypeList,
                            placeholder: "Select ignored",
                        },
                    ],
                },
            ]}
            onSubmit={({ content, types }) => onCreated(content as string, types as ChannelIgnoreType[])}
            resetOnSubmission
        />
    );
}
