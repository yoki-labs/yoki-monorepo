import { Box, Card, CardContent, Chip, ListItemDecorator, MenuItem, Stack, Typography } from "@mui/joy";
import { SanitizedRole } from "../../../lib/@types/db";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faPen, faShieldHalved, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@yokilabs/utils";
import LabsIconWrapper from "../../LabsIconWrapper";
import LabsOverflowButton from "../../LabsOverflowButton";
import React from "react";
import LabsForm, { LabsFormState } from "../../LabsForm";
import { LabsFormFieldType } from "../../form";
import { RolePayload } from "@guildedjs/api";
import { RoleType } from "@prisma/client";

type Props = {
    serverId: string;
    serverRoles: RolePayload[];
    role: SanitizedRole;
    timezone: string | null;
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
        const { serverId, serverRoles, role, timezone } = this.props;
        const serverRole = this.currentServerRole;
        
        return (
            <>
                {/* The hashtag icon (kind of useless, but there should be indication that it is a channel), channel ID */}
                <Stack component="header" gap={2} direction="row" alignItems="center">
                    <LabsIconWrapper>
                        <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faShieldHalved} />
                    </LabsIconWrapper>
                    {/* TODO: Replace it with proper channel name */}
                    <Typography level="h1" fontSize="md" fontWeight="bolder">
                        {serverRole?.name ?? role.roleId}
                    </Typography>
                    <Stack sx={{ flex: "1" }} direction="row" gap={1} alignItems="center">
                        <Chip variant="outlined" sx={{ flex: "1" }}>{role.type}</Chip>
                    </Stack>
                    <LabsOverflowButton id={`logs-${serverId}-${role.roleId}`}>
                        <MenuItem onClick={() => this.toggleEditMode(true)}>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faPen} />
                            </ListItemDecorator>
                            Edit role
                        </MenuItem>
                        <MenuItem color="danger">
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faTrash} />
                            </ListItemDecorator>
                            Delete role
                        </MenuItem>
                    </LabsOverflowButton>
                </Stack>
                <CardContent>
                    <Box sx={{ mt: 0.5 }}>
                        {/* Additional info, such as its creation date */}
                        <Typography level="body2">
                            {formatDate(new Date(role.createdAt), timezone)}
                        </Typography>
                    </Box>
                </CardContent>
            </>
        );
    }

    RoleItemEditMode() {
        const { serverRoles, role, timezone } = this.props;
        const onSubmit = this.onRoleItemEdit.bind(this);

        return (
            <LabsForm
                sections={[
                    {
                        row: true,
                        start: (
                            <LabsIconWrapper>
                                <FontAwesomeIcon style={{ width: "100%", height: "100%" }} icon={faShieldHalved} />
                            </LabsIconWrapper>
                        ),
                        fields: [
                            {
                                type: LabsFormFieldType.Select,
                                prop: "roleId",
                                defaultValue: role.roleId,
                                selectableValues: serverRoles.sort((a, b) => b.position - a.position).map((serverRole) => ({
                                    name: serverRole.name,
                                    value: serverRole.id,
                                    avatarIcon: serverRole.icon,
                                }))
                            },
                            {
                                type: LabsFormFieldType.Select,
                                prop: "type",
                                selectableValues: staffRoleTypes.map((roleType) => ({
                                    name: roleType[0] + roleType.toLowerCase().slice(1),
                                    value: roleType,
                                })),
                                defaultValue: role.type,
                                placeholder: "Select role level"
                            }
                        ],
                    },
                    {
                        description: formatDate(new Date(role.createdAt), timezone),
                        fields: []
                    }
                ]}
                onSubmit={onSubmit}
                onCancel={() => this.toggleEditMode(false)}
                canCancel
            />
        );
    }

    onRoleItemEdit(state: LabsFormState) {
        this.toggleEditMode(false);
    }

    render() {
        const { inEditMode } = this.state;
        const RoleItemStaticMode = this.RoleItemStaticMode.bind(this);
        const RoleItemEditMode = this.RoleItemEditMode.bind(this);

        return (
            <Card>
                { inEditMode ? <RoleItemEditMode /> : <RoleItemStaticMode /> }
            </Card>
        )
    }
}