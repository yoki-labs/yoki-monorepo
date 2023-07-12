import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItemButton, ListItemDecorator, Typography } from "@mui/joy";

export interface LayoutModule {
    name: string;
    icon: IconDefinition;
}

interface Prop {
    item: LayoutModule;
    isActive: boolean;
    onClick: () => unknown;
}

/**
 * Renders layout's navigation tab.
 * @param props The component properties.
 * @returns {Element} Rendered component
 */
export default function LayoutSidebarTab({ item, isActive, onClick }: Prop) {
    const textColor = isActive ? "text.secondary" : "text.tertiary";

    return (
        <ListItemButton selected={isActive} onClick={onClick}>
            <ListItemDecorator>
                <FontAwesomeIcon icon={item.icon} className={`${isActive ? "text-spacelight-500" : "text-spacelight-400"}`} />
            </ListItemDecorator>
            <Typography component="span" textColor={textColor}>
                {item.name}
            </Typography>
        </ListItemButton>
    );
}
