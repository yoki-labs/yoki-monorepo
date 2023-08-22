import React from "react";
import { SanitizedRole } from "../../../lib/@types/db";
import { Card, CircularProgress, Stack, Typography } from "@mui/joy";
import { DashboardPageProps } from "../pages";
import { RolePayload } from "@guildedjs/api";
import DashboardRole, { RoleItemEditor } from "./RoleItem";
import { RoleType } from "@prisma/client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type Role = SanitizedRole;

type State = {
    isLoaded: boolean;
    roles: Role[];
    serverRoles: RolePayload[];
};

export default class RolesPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, roles: [], serverRoles: [] };
    }

    async componentDidMount(): Promise<void> {
        const { serverConfig: { serverId } } = this.props;
        await fetch(`/api/servers/${serverId}/roles`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
        .then((response) => {
            if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ roles, serverRoles }) => this.setState({ isLoaded: true, roles, serverRoles }))
            .catch((errorResponse) => console.error("Error while fetching data:", errorResponse));
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
        });
    }

    async onRoleUpdate(role: SanitizedRole, data: { newRoleId: number | null, newType: RoleType | null, }) {
        const { serverId, roleId, createdAt, type } = role;
        const { roles } = this.state;
        const index = roles.findIndex((x) => x.roleId === roleId);

        // To change the state of the role that was updated
        this.setState({
            roles:  [
                ...roles.slice(0, index),
                { serverId, roleId: data.newRoleId ?? roleId, type: data.newType ?? type, createdAt },
                ...roles.slice(index + 1)
            ]
        });

        return fetch(`/api/servers/${serverId}/roles/${roleId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data)
        });
    }
    
    async onRoleCreate(roleId: number, type: RoleType) {
        const { serverId } = this.props.serverConfig;
        const { roles } = this.state;

        this.setState({
            roles: roles.concat({ serverId, roleId, type, createdAt: new Date().toISOString() } as Role)
        });

        return fetch(`/api/servers/${serverId}/roles`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ roleId, type })
        });
    }

    render() {
        const { serverConfig } = this.props;
        const { isLoaded, roles, serverRoles } = this.state;

        // Still fetching data
        if (!isLoaded)
            return <CircularProgress />;

        return (
            <>
                <Typography level="h2">Staff roles</Typography>
                <Card>
                    <RoleItemEditor
                        icon={faPlus}
                        submitText="Create"
                        type={RoleType.MOD}
                        serverRoles={serverRoles}
                        onSubmit={({ values: { roleId, type } }) => this.onRoleCreate(roleId as number, type as RoleType)}
                        />
                </Card>
                <Stack direction="column" gap={2}>
                    {roles.map((role) =>
                        <DashboardRole
                            serverId={serverConfig.serverId}
                            role={role}
                            serverRoles={serverRoles}
                            timezone={serverConfig.timezone}
                            onDelete={this.onRoleDelete.bind(this, role)}
                            onUpdate={this.onRoleUpdate.bind(this, role)}
                            />
                    )}
                </Stack>
            </>
        );
    }
}