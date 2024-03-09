import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chip, ListItemButton, ListItemDecorator, Typography } from "@mui/joy";
import { DashboardPageItem } from "../pages";
import { useRouter } from "next/router";

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
    const router = useRouter();
    const href = `/dashboard/${serverId}/${item.id}`;

    console.log("Item", item);
    return (
        <ListItemButton sx={(theme) => ({ borderRadius: theme.vars.radius.xs })} color={isActive ? item.color ?? "primary" : item.color} selected={isActive} onClick={() => router.push(href)}>
            <ListItemDecorator>
                <FontAwesomeIcon icon={item.icon} />
            </ListItemDecorator>
            <Typography sx={{ color: "inherit" }} component="span" endDecorator={item.wip && <Chip variant="soft" color="primary">WIP</Chip>}>
                {item.name}
            </Typography>
        </ListItemButton>
    );
}
