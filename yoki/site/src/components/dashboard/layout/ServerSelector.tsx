import { Avatar, ListItemDecorator, Option, SelectOption } from "@mui/joy";
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
                {server.name}
            </>
        );
    }

    render() {
        const { servers, defaultValue } = this.props;

        return (
            <LabsDropdown
                placeholder="Select server"
                defaultValue={defaultValue}
                renderValue={this.renderValue.bind(this)}
                onChange={async (_, serverId) => serverId && (await this.props.onChange(serverId))}
            >
                {servers.map((server) => (
                    <Option key={server.id} value={server.id} label={server.name}>
                        {this.renderOption(server)}
                    </Option>
                ))}
            </LabsDropdown>
        );
    }
}
