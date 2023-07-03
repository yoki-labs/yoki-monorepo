import React from "react";
import { GuildedServer } from "../../../lib/@types/guilded/Server";
import { Avatar, FormControl, ListItemDecorator, Option, Select, SelectOption } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import LabsDropdown from "../../LabsDropdown";

type Props = {
    servers: GuildedServer[];
};

export class ServerSelector extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    renderValue(option: SelectOption<string> | null) {
        const server: GuildedServer | null = option ? this.props.servers.find((x) => x.id === option.value)! : null;

        return server && this.renderOption(server);
    }

    renderOption(server: GuildedServer) {
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
        const { servers } = this.props;

        return (
            <LabsDropdown placeholder="Select server" renderValue={this.renderValue.bind(this)}>
                {servers.map((server) => (
                    <Option value={server.id} label={server.name}>
                        {this.renderOption(server)}
                    </Option>
                ))}
            </LabsDropdown>
        );
    }
}
