import { Box, Card, CardContent, Chip, ListItemDecorator, MenuItem, Stack, Typography } from "@mui/joy";
import { SanitizedRole } from "../../../lib/@types/db";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, faPen, faPlus, faShieldHalved, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@yokilabs/utils";
import LabsIconWrapper from "../../LabsIconWrapper";
import LabsOverflowButton from "../../LabsOverflowButton";
import React from "react";
import LabsForm, { LabsFormFieldValueMap } from "../../LabsForm";
import { LabsFormFieldOption, LabsFormFieldType, LabsFormSection } from "../../form";
import { RolePayload } from "@guildedjs/api";
import { RoleType } from "@prisma/client";

type Props = {
    serverId: string;
    serverRoles: RolePayload[];
    serverRoleOptions: LabsFormFieldOption<number>[];
    role: SanitizedRole;
    timezone: string | null;
    onUpdate: (data: { newRoleId: number | null; newType: RoleType | null }) => unknown;
    onDelete: () => unknown;
};
// Edit mode exists instead of putting you right away there because there may be too many Select form fields
// With too many roles and too many types at a time and it can be pretty laggy, especially on lower-end
// Devices. Guilded allows too many roles.
type State = {
    inEditMode: boolean;
};

const staffRoleTypes = [RoleType.ADMIN, RoleType.MOD, RoleType.MINIMOD];

export default class DashboardRole extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { inEditMode: false };
    }

    toggleEditMode(inEditMode: boolean) {
        this.setState({ inEditMode });
    }

    get currentServerRole() {
        const { serverRoles, role } = this.props;

        return serverRoles.find((serverRole) => serverRole.id === role.roleId);
    }

    RoleItemStaticMode() {
        const { serverId, role, timezone, onDelete } = this.props;
        const serverRole = this.currentServerRole;

        return (
            <>
                {/* The hashtag icon (kind of useless, but there should be indication that it is a channel), channel ID */}
                <Stack component="header" gap={2} direction="row" alignItems="center">
                    <LabsIconWrapper className="hidden md:block">
                        <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faShieldHalved} />
                    </LabsIconWrapper>
                    {/* TODO: Replace it with proper channel name */}
                    <Typography level="h1" fontSize="md" fontWeight="bolder" className="grow md:grow-0">
                        {serverRole?.name ?? role.roleId}
                    </Typography>
                    <Stack sx={{ flex: "1" }} direction="row" gap={1} alignItems="center" className="hidden md:flex">
                        <Chip color="primary" variant="outlined" sx={{ flex: "1" }}>
                            {role.type}
                        </Chip>
                    </Stack>
                    <LabsOverflowButton variant="outlined" id={`logs-${serverId}-${role.roleId}`}>
                        <MenuItem onClick={() => this.toggleEditMode(true)}>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faPen} />
                            </ListItemDecorator>
                            Edit role
                        </MenuItem>
                        <MenuItem onClick={onDelete} color="danger">
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faTrash} />
                            </ListItemDecorator>
                            Delete role
                        </MenuItem>
                    </LabsOverflowButton>
                </Stack>
                <CardContent>
                    <Box sx={{ flex: "1", my: 1 }} className="block md:hidden">
                        <Chip color="primary" variant="outlined" sx={{ flex: "1" }}>
                            {role.type}
                        </Chip>
                    </Box>
                    <Box sx={{ mt: 0.5 }}>
                        {/* Additional info, such as its creation date */}
                        <Typography level="body-md">{formatDate(new Date(role.createdAt), timezone)}</Typography>
                    </Box>
                </CardContent>
            </>
        );
    }

    RoleItemEditMode() {
        const { serverRoleOptions, role, timezone } = this.props;
        const onSubmit = this.onRoleItemEdit.bind(this);

        return (
            <LabsForm
                sections={
                    [
                        {
                            row: true,
                            start: (
                                <LabsIconWrapper className="hidden md:block">
                                    <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faShieldHalved} />
                                </LabsIconWrapper>
                            ),
                            fields: [
                                {
                                    type: LabsFormFieldType.Select,
                                    prop: "roleId",
                                    defaultValue: role.roleId,
                                    selectableValues: serverRoleOptions,
                                    placeholder: "Select role",
                                },
                                {
                                    type: LabsFormFieldType.Select,
                                    prop: "type",
                                    selectableValues: staffRoleTypes.map((roleType) => ({
                                        name: roleType[0] + roleType.toLowerCase().slice(1),
                                        value: roleType,
                                    })),
                                    defaultValue: role.type,
                                    placeholder: "Select role level",
                                },
                            ],
                        },
                        {
                            hideDivider: true,
                            description: formatDate(new Date(role.createdAt), timezone),
                            fields: [],
                        },
                    ].filter(Boolean) as LabsFormSection[]
                }
                onSubmit={onSubmit}
                onCancel={this.toggleEditMode.bind(this, false)}
            />
        );
    }

    onRoleItemEdit(values: LabsFormFieldValueMap) {
        const {
            onUpdate,
            role: { roleId, type },
        } = this.props;

        this.toggleEditMode(false);

        return onUpdate({
            newRoleId: roleId !== values.roleId ? (values.roleId as number) : null,
            newType: type !== values.type ? (values.type as RoleType) : null,
        });
    }

    render() {
        const { inEditMode } = this.state;
        const RoleItemStaticMode = this.RoleItemStaticMode.bind(this);
        const RoleItemEditMode = this.RoleItemEditMode.bind(this);

        return <Card>{inEditMode ? <RoleItemEditMode /> : <RoleItemStaticMode />}</Card>;
    }
}

type EditorProps = {
    serverRoleOptions: LabsFormFieldOption<number>[];
    onCreate: (roleId: number, type: RoleType) => Promise<unknown>;
};

export function RoleItemCreationForm({ serverRoleOptions, onCreate }: EditorProps) {
    return (
        <LabsForm
            sections={
                [
                    {
                        row: true,
                        start: (
                            <LabsIconWrapper className="hidden md:block">
                                <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faPlus} />
                            </LabsIconWrapper>
                        ),
                        fields: [
                            {
                                type: LabsFormFieldType.Select,
                                prop: "roleId",
                                selectableValues: serverRoleOptions,
                                placeholder: "Select role to add",
                            },
                            {
                                type: LabsFormFieldType.Select,
                                prop: "type",
                                selectableValues: staffRoleTypes.map((roleType) => ({
                                    name: roleType[0] + roleType.toLowerCase().slice(1),
                                    value: roleType,
                                })),
                                placeholder: "Select role level",
                            },
                        ],
                    },
                ].filter(Boolean) as LabsFormSection[]
            }
            onSubmit={({ roleId, type }) => onCreate(roleId as number, type as RoleType)}
        />
    );
}
