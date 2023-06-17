import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItemButton, ListItemButtonClasses, ListItemIcon, ListItemText, SxProps, Theme } from "@mui/material";

export interface LayoutModule {
    name: string;
    icon: IconDefinition;
}

interface Prop {
    item: LayoutModule;
    isActive: boolean;
    onClick: () => unknown;
}

const sidebarTabClasses: Partial<ListItemButtonClasses> = {
    selected: "bg-spacedark-900",
};

/**
 * Renders layout's navigation tab.
 * @param props The component properties.
 * @returns {Element} Rendered component
 */
export default function LayoutSidebarTab({ item, isActive, onClick }: Prop) {
    const textClass = `${isActive ? "text-spacelight-600" : "text-spacelight-400"}`;

    return (
        <ListItemButton selected={isActive} onClick={onClick} classes={sidebarTabClasses}>
            <ListItemIcon>
                <FontAwesomeIcon icon={item.icon} className={`${isActive ? "text-spacelight-400" : "text-spacelight-300"}`} />
            </ListItemIcon>
            <ListItemText className={textClass} primary={item.name} />
        </ListItemButton>
    );
}
