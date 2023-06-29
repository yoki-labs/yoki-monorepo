import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItemButton, ListItemDecorator } from "@mui/joy";

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
    const textClass = `${isActive ? "text-spacelight-600" : "text-spacelight-400"}`;

    return (
        <ListItemButton selected={isActive} onClick={onClick}>
            <ListItemDecorator>
                <FontAwesomeIcon icon={item.icon} className={`${isActive ? "text-spacelight-400" : "text-spacelight-300"}`} />
            </ListItemDecorator>
            <span className={textClass}>{ item.name }</span>
        </ListItemButton>
    );
}
