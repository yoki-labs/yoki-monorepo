import React from "react";
import { SanitizedRole } from "../../../lib/@types/db";
import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/joy";
import { DashboardPageProps } from "../pages";
import { RolePayload } from "@guildedjs/api";
import DashboardRole, { RoleItemCreationForm } from "./RoleItem";
import { RoleType } from "@prisma/client";
import { optionifyRoles } from "./role";
import BaseRolesForm from "./BaseRoleForm";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";

type Role = SanitizedRole;

type State = {
    isLoaded: boolean;
    roles: Role[];
    serverRoles: RolePayload[];
    error?: { code: string; message: string };
};

export default class RolesPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, roles: [], serverRoles: [] };
    }

    async componentDidMount(): Promise<void> {
        const {
            serverConfig: { serverId },
        } = this.props;
        await fetch(`/api/servers/${serverId}/roles`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ roles, serverRoles }) => this.setState({ isLoaded: true, roles, serverRoles }))
            .catch(async (errorResponse) => this.onFetchError(errorResponse));
    }

    async onFetchError(errorResponse: Response) {
        const error = await errorResponse.json();

        console.log("Error while fetching role data:", error);

        this.setState({ error });
    }

    async onRoleDelete(role: SanitizedRole) {
        const { serverId, roleId } = role;
        const { roles } = this.state;

        const index = roles.findIndex((x) => x.roleId === roleId);

        // Remove it from the state
        this.setState({
            roles: [...roles.slice(0, index), ...roles.slice(index + 1)],
        });

        return fetch(`/api/servers/${serverId}/roles/${roleId}`, {
            method: "DELETE",
            headers: { "content-type": "application/json" },
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while deleting staff role"));
    }

    async onRoleUpdate(role: SanitizedRole, data: { newRoleId: number | null; newType: RoleType | null }) {
        const { serverId, roleId, createdAt, type } = role;
        const { roles } = this.state;
        const index = roles.findIndex((x) => x.roleId === roleId);

        // To change the state of the role that was updated
        this.setState({
            roles: [...roles.slice(0, index), { serverId, roleId: data.newRoleId ?? roleId, type: data.newType ?? type, createdAt }, ...roles.slice(index + 1)],
        });

        return fetch(`/api/servers/${serverId}/roles/${roleId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while updating role data"));
    }

    async onRoleCreate(roleId: number, type: RoleType) {
        const { serverId } = this.props.serverConfig;
        const { roles } = this.state;

        this.setState({
            roles: roles.concat({ serverId, roleId, type, createdAt: new Date().toISOString() } as Role),
        });

        return fetch(`/api/servers/${serverId}/roles`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ roleId, type }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while creating role data"));
    }

    render() {
        const { serverConfig } = this.props;
        const { error, isLoaded, roles, serverRoles } = this.state;

        // Server-side error
        if (error)
            return (
                <PagePlaceholder icon={PagePlaceholderIcon.Unexpected} title={`Error while fetching data (${error.code})`}>
                    {error.message}
                </PagePlaceholder>
            );
        // Still fetching data
        else if (!isLoaded) return <RolesPageSkeleton />;

        const roleOptions = optionifyRoles(serverRoles);

        return (
            <Box>
                <Typography level="h2" sx={{ mb: 2 }}>
                    Roles
                </Typography>
                <Typography level="title-md" gutterBottom>
                    Base roles
                </Typography>
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <BaseRolesForm serverRoleOptions={roleOptions} serverConfig={serverConfig} />
                    </CardContent>
                </Card>
                <Typography level="title-md" gutterBottom>
                    Staff roles
                </Typography>
                <Card sx={{ mb: 2 }}>
                    <RoleItemCreationForm serverRoleOptions={roleOptions} onCreate={this.onRoleCreate.bind(this)} />
                </Card>
                <Stack direction="column" gap={2}>
                    {roles.map((role) => (
                        <DashboardRole
                            serverId={serverConfig.serverId}
                            role={role}
                            serverRoles={serverRoles}
                            serverRoleOptions={roleOptions}
                            timezone={serverConfig.timezone}
                            onDelete={this.onRoleDelete.bind(this, role)}
                            onUpdate={this.onRoleUpdate.bind(this, role)}
                        />
                    ))}
                </Stack>
            </Box>
        );
    }
}

/**
 * The barebones skeleton of the page for when roles page is loading.
 * @returns Roles page skeleton
 */
function RolesPageSkeleton() {
    return (
        <Box sx={{ overflow: "hidden" }}>
            <Typography level="h2" sx={{ mb: 2 }}>
                <Skeleton animation="wave">Roles</Skeleton>
            </Typography>
            <Typography level="title-md" gutterBottom>
                <Skeleton animation="wave">Base roles</Skeleton>
            </Typography>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography level="title-md" sx={{ mb: 1 }}>
                        <Skeleton animation="wave">Mute role</Skeleton>
                    </Typography>
                    <Skeleton animation="wave" width="100%" height={40} sx={{ position: "initial", mb: 0 }} />
                    <Typography level="body-sm" sx={{ mb: 2 }}>
                        <Skeleton animation="wave">The role that will be assigned when user gets muted.</Skeleton>
                    </Typography>
                    <Typography level="body-sm" sx={{ mb: 1 }}>
                        <Skeleton animation="wave">Member role</Skeleton>
                    </Typography>
                    <Skeleton animation="wave" width="100%" height={40} sx={{ position: "initial" }} />
                    <Typography level="body-sm" sx={{ mb: 2 }}>
                        <Skeleton animation="wave">The role that will be assigned when user gets muted.</Skeleton>
                    </Typography>
                    <Typography level="body-sm" sx={{ mb: 1 }}>
                        <Skeleton animation="wave">Modmail support role</Skeleton>
                    </Typography>
                    <Skeleton animation="wave" width="100%" height={40} sx={{ position: "initial" }} />
                    <Typography level="body-sm">
                        <Skeleton animation="wave">The role that will be mentioned privately and silently when a new modmail ticket is created by a user.</Skeleton>
                    </Typography>
                </CardContent>
            </Card>
            <Typography level="title-md" sx={{ mb: 1 }}>
                <Skeleton animation="wave">Staff roles</Skeleton>
            </Typography>
            <Card>
                <Stack direction="row" gap={2} alignItems="center">
                    <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ position: "initial" }} />
                    <Skeleton animation="wave" width={182} height={40} sx={{ position: "initial" }} />
                    <Skeleton animation="wave" width={100} height={40} sx={{ position: "initial" }} />
                </Stack>
            </Card>
            <RolesPageRoleSkeleton />
            <RolesPageRoleSkeleton />
            <RolesPageRoleSkeleton />
        </Box>
    );
}

function RolesPageRoleSkeleton() {
    return (
        <Card sx={{ mt: 2 }}>
            <Stack direction="row" gap={2} alignItems="center">
                <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ position: "initial" }} />
                <Skeleton animation="wave" width={162} height={20} sx={{ position: "initial" }} />
                <Skeleton animation="wave" width={70} height={25} sx={{ position: "initial" }} />
            </Stack>
            <Skeleton animation="wave" width={222} height={20} sx={{ position: "initial" }} />
        </Card>
    );
}
