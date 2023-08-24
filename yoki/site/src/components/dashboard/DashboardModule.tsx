import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import LabsSwitch from "../LabsSwitch";
import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/joy";
import LabsIconCard from "../LabsIconCard";

export type Props = {
    name: string;
    icon: IconDefinition;
    description: string;

    activeClassName: string;
    isActive: boolean;
    onToggle: (value: boolean) => unknown;
    
    iconAspectRatio?: number;
    hideBadges?: boolean;
    requiresPremium?: boolean;
    largeHeader?: boolean;
};

export default class DashboardModule extends React.Component<Props, { isActive: boolean }> {
    constructor(props: Props) {
        super(props);
        this.state = { isActive: props.isActive };
    }

    onToggle(value: boolean) {
        this.setState({ isActive: value });

        this.props.onToggle(value);
    }

    render() {
        const { name, description, icon, activeClassName, requiresPremium, hideBadges, iconAspectRatio, largeHeader } = this.props;
        const { isActive } = this.state;

        return (
            <LabsIconCard icon={icon} iconAspectRatio={iconAspectRatio} iconClassName={isActive ? activeClassName : ""} iconWidth={80}>
                <Box className="grow">
                    <Stack direction="row" gap={4}>
                        <Typography className="grow" fontWeight="md" level="body1" fontSize={largeHeader ? "lg" : "md"}>
                            {name}
                        </Typography>
                        <LabsSwitch className="toggle justify-end" defaultChecked={this.props.isActive} onChange={({ target }) => this.onToggle(target.checked)} />
                    </Stack>
                    <Typography level="body2">{description}</Typography>
                </Box>
                {
                    !hideBadges &&
                    <Box mt={2}>
                        <Chip color={requiresPremium ? "warning" : "neutral"}>{ requiresPremium ? "Premium" : "Free" }</Chip>
                    </Box>
                }
            </LabsIconCard>
        );
    }
}
