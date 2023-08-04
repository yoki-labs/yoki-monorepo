import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItemButton, ListItemDecorator, Typography } from "@mui/joy";
import { DashboardPageItem } from "../pages";

interface Prop {
    item: DashboardPageItem;
    isActive: boolean;
    onClick: () => unknown;
}

/**
 * Renders layout's navigation tab.
 * @param props The component properties.
 * @returns {Element} Rendered component
 */
export default function LayoutSidebarTab({ item, isActive, onClick }: Prop) {
    return (
        <ListItemButton sx={{ borderRadius: 6 }} color={item.color} selected={isActive} onClick={onClick}>
            <ListItemDecorator sx={{ color: "inherit" }}>
                <FontAwesomeIcon icon={item.icon} />
            </ListItemDecorator>
            <Typography sx={{ color: "inherit" }} component="span">
                {item.name}
            </Typography>
        </ListItemButton>
    );
}
