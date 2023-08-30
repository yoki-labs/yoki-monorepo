import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItemButton, ListItemDecorator, Typography } from "@mui/joy";
import { DashboardPageItem } from "../pages";
import Link from "next/link";

interface Prop {
    item: DashboardPageItem;
    serverId: string;
    isActive: boolean;
}

/**
 * Renders layout's navigation tab.
 * @param props The component properties.
 * @returns {Element} Rendered component
 */
export default function LayoutSidebarTab({ item, serverId, isActive }: Prop) {
    return (
        <Link href={`/dashboard/${serverId}/${item.id}`} style={{ textDecoration: "none" }}>
            <ListItemButton sx={{ borderRadius: 6 }} color={item.color} selected={isActive}>
                <ListItemDecorator>
                    <FontAwesomeIcon icon={item.icon} />
                </ListItemDecorator>
                <Typography sx={{ color: "inherit" }} component="span">
                    {item.name}
                </Typography>
            </ListItemButton>
        </Link>
    );
}
