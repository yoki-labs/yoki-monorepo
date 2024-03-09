import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Box, Chip, Stack, Switch, Tooltip, Typography } from "@mui/joy";
import LabsIconCard from "../LabsIconCard";
import { SanitizedServer } from "../../lib/@types/db";
import { toggleModule } from "./modules";
import { PremiumType } from "@prisma/client";

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
    requiresPremium?: PremiumType;
    requiresEarlyAccess?: boolean;
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
        const { name, description, icon, activeClassName, requiresPremium, requiresEarlyAccess, hideBadges: titleBarBadges, disabled, largeHeader } = this.props;
        const { isActive } = this.state;

        return (
            <LabsIconCard icon={icon} iconSize={80} iconClassName={isActive ? activeClassName : ""} useFontColor={!isActive}>
                <Box className="grow">
                    <Stack direction="row" gap={4}>
                        <Typography
                            className="grow"
                            fontWeight="md"
                            level={largeHeader ? "title-lg" : "title-md"}
                            endDecorator={
                                (requiresPremium || requiresEarlyAccess) &&
                                titleBarBadges && (
                                    <span className="hidden md:block">
                                        <ModuleBadge size="sm" earlyAccess={requiresEarlyAccess} premium={requiresPremium} />
                                    </span>
                                )
                            }
                        >
                            {name}
                        </Typography>
                        {!disabled && <Switch className="toggle justify-end" defaultChecked={this.state.isActive} onChange={({ target }) => this.onToggle(target.checked)} />}
                    </Stack>
                    <Typography level="body-md">{description}</Typography>
                </Box>
                <Box mt={2} className={titleBarBadges ? `block md:hidden` : ``}>
                    <ModuleBadge earlyAccess={requiresEarlyAccess} premium={requiresPremium} />
                </Box>
            </LabsIconCard>
        );
    }
}

function ModuleBadge({ earlyAccess, premium, size }: { earlyAccess?: boolean | undefined; premium: PremiumType | undefined | null; size?: "sm" | "md" | "lg" }) {
    return earlyAccess ? (
        <Tooltip title="This requires Yoki early access">
            <Chip variant="soft" size={size} color="danger">
                Early Access
            </Chip>
        </Tooltip>
    ) : (
        <Tooltip title={premium ? `This module requires ${premium} tier subscription of Yoki Labs.` : `This module is available for everyone to use for free.`}>
            <Chip variant="soft" size={size} color={premium ? "warning" : "neutral"}>
                {premium ? "Premium" : "Free"}
            </Chip>
        </Tooltip>
    );
}
