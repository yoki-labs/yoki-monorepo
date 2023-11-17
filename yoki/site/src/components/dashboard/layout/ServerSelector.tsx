import { Avatar, Box, ListItemDecorator, Option, SelectOption, Typography } from "@mui/joy";
import React from "react";

import { GuildedClientServer } from "../../../lib/@types/guilded";
import LabsDropdown from "../../form/LabsDropdown";

interface Props {
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

        return server && this.renderOption(server);
    }

    renderOption(server: GuildedClientServer) {
        return (
            <>
                <ListItemDecorator>
                    <Avatar size="sm" src={server.profilePicture ?? void 0} />
                </ListItemDecorator>
                <Typography fontWeight="bolder" textColor="text.secondary">
                    {server.name}
                </Typography>
            </>
        );
    }

    render() {
        const { servers, defaultValue } = this.props;

        const sortedServers = servers.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);

        return (
            <LabsDropdown
                placeholder="Select server"
                defaultValue={defaultValue}
                renderValue={this.renderValue.bind(this)}
                onChange={async (_, serverId) => serverId && (await this.props.onChange(serverId))}
            >
                {sortedServers.map((server) => (
                    <Option key={server.id} value={server.id} label={server.name}>
                        <ListItemDecorator>
                            <Avatar size="sm" src={server.profilePicture ?? void 0} />
                        </ListItemDecorator>
                        <Box>
                            <Typography fontWeight="bolder">{server.name}</Typography>
                            <Typography textColor="text.tertiary">/{server.subdomain}</Typography>
                        </Box>
                    </Option>
                ))}
            </LabsDropdown>
        );
    }
}
