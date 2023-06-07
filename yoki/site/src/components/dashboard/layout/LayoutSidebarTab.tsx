import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    return (
        <li key={item.name} className={isActive ? "bg-spacedark-900 text-spacelight-500 rounded-lg" : "rounded-lg text-spacelight-400"} onClick={onClick}>
            <div className="flex flex-row">
                <FontAwesomeIcon icon={item.icon} className={`w-4 mr-1 ${isActive ? "text-spacelight-400" : "text-spacelight-300"}`} />
                <p className="text-md">{item.name}</p>
            </div>
        </li>
    );
}
