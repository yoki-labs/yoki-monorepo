import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItemButton, ListItemDecorator, Typography } from "@mui/joy";
import { useRouter } from "next/router";
import { ProfilePageItem } from "./pages";

interface Prop {
    item: ProfilePageItem;
    isActive: boolean;
}

/**
 * Renders layout's navigation tab.
 * @param props The component properties.
 * @returns {Element} Rendered component
 */
export default function ProfileSidebarTab({ item, isActive }: Prop) {
    const router = useRouter();
    const href = `/profile/${item.id}`;

    return (
        <ListItemButton sx={{ borderRadius: "radius.sm" }} color={item.color} selected={isActive} onClick={() => router.push(href)}>
            <ListItemDecorator>
                <FontAwesomeIcon icon={item.icon} />
            </ListItemDecorator>
            <Typography sx={{ color: "inherit" }} component="span">
                {item.name}
            </Typography>
        </ListItemButton>
    );
}
