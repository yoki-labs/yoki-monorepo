import { Avatar, Box, Divider, ListItemDecorator, MenuItem, Option, SelectOption, Typography } from "@mui/joy";
import React from "react";

import { GuildedClientServer, GuildedServer } from "../../../lib/@types/guilded";
import LabsDropdown from "../../form/LabsDropdown";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointer } from "@fortawesome/free-solid-svg-icons";

interface Props {
    currentServer?: GuildedServer;
    servers: GuildedClientServer[];
    defaultValue?: string;
    onChange: (serverId: string) => unknown | Promise<unknown>;
}

export class ServerSelector extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    renderValue(option: SelectOption<string> | null) {
        const server: GuildedClientServer | null = option ? this.props.servers.find((x) => x.id === option.value)! : null;

        return server && <SelectedServerOption name={server.name} avatar={server.profilePicture} />;
    }

    renderCurrentServer() {
        const { currentServer } = this.props;

        return currentServer && <SelectedServerOption name={currentServer.name} avatar={currentServer.avatar} />;
    }

    render() {
        const { currentServer, servers, defaultValue } = this.props;
        if (!servers || !Array.isArray(servers)) return null;
        const sortedServers = servers.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
        
        return (
            <LabsDropdown
                placeholder="Select server"
                defaultValue={defaultValue}
                renderValue={this.renderCurrentServer.bind(this)}
                onChange={async (_, serverId) => serverId && (await this.props.onChange(serverId))}
            >
                {currentServer && <>
                    <Link href="/dashboard" style={{ textDecoration: "none" }}>
                        <MenuItem>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faHandPointer} />
                            </ListItemDecorator>
                            <Box>
                                <Typography fontWeight="bolder">Select other</Typography>
                                <Typography textColor="text.tertiary">Go back to server selection page</Typography>
                            </Box>
                        </MenuItem>
                    </Link>
                    <Divider />
                </>}
                {servers.length
                    ? sortedServers.map((server) => <ServerOption id={server.id} name={server.name} subdomain={server.subdomain} avatar={server.profilePicture} />)
                    : currentServer && <ServerOption id={currentServer.id} name={currentServer.name} subdomain={currentServer.url} avatar={currentServer.avatar} />}
            </LabsDropdown>
        );
    }
}

function ServerOption({ id, name, subdomain, avatar }: { id: string; name: string; subdomain?: string | null | undefined; avatar: string | null | undefined }) {
    return (
        <Option key={id} value={id} label={name}>
            <ListItemDecorator>
                <Avatar size="sm" src={avatar ?? void 0} />
            </ListItemDecorator>
            <Box>
                <Typography fontWeight="bolder">{name}</Typography>
                {subdomain && <Typography textColor="text.tertiary">/{subdomain}</Typography>}
            </Box>
        </Option>
    );
}

function SelectedServerOption({ name, avatar }: { name: string; avatar: string | undefined | null }) {
    return (
        <>
            <ListItemDecorator>
                <Avatar size="sm" src={avatar ?? void 0} />
            </ListItemDecorator>
            <Typography level="title-lg" fontWeight="bolder" textColor="text.secondary">
                {name}
            </Typography>
        </>
    );
}
