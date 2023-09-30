import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Box, Chip, Stack, Switch, Typography } from "@mui/joy";
import LabsIconCard from "../LabsIconCard";
import { SanitizedServer } from "../../lib/@types/db";
import { toggleModule } from "./modules";

export type Props = {
    name: string;
    icon: IconDefinition;
    description: string;

    activeClassName: string;
    //isActive: boolean;
    //onToggle: (value: boolean) => unknown;
    prop: keyof SanitizedServer;
    serverConfig: SanitizedServer;

    hideBadges?: boolean;
    requiresPremium?: boolean;
    disabled?: boolean;
    largeHeader?: boolean;
};

export default class DashboardModule extends React.Component<Props, { isActive: boolean }> {
    constructor(props: Props) {
        super(props);

        const { serverConfig, prop: propType } = this.props;

        this.state = { isActive: serverConfig[propType] as boolean };
    }

    async onToggle(value: boolean) {
        const { serverConfig, prop: propType } = this.props;

        this.setState({ isActive: value });

        return toggleModule(serverConfig.serverId, propType, value);
        // this.props.onToggle(value);
    }

    render() {
        const { name, description, icon, activeClassName, requiresPremium, hideBadges, disabled, largeHeader } = this.props;
        const { isActive } = this.state;

        return (
            <LabsIconCard icon={icon} iconSize={80} iconClassName={isActive ? activeClassName : ""}>
                <Box className="grow">
                    <Stack direction="row" gap={4}>
                        <Typography className="grow" fontWeight="md" level={largeHeader ? "title-lg" : "title-md"}>
                            {name}
                        </Typography>
                        <Switch className="toggle justify-end" disabled={disabled} defaultChecked={this.state.isActive} onChange={({ target }) => this.onToggle(target.checked)} />
                    </Stack>
                    <Typography level="body-md">{description}</Typography>
                </Box>
                {!hideBadges && (
                    <Box mt={2}>
                        <Chip color={requiresPremium ? "warning" : "neutral"}>{requiresPremium ? "Premium" : "Free"}</Chip>
                    </Box>
                )}
            </LabsIconCard>
        );
    }
}
