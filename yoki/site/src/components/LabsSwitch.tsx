import { IconDefinition, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, SwitchProps } from "@mui/joy";

type AdditionalProps = {
    activeIcon?: IconDefinition;
    deactivatedIcon?: IconDefinition;
};

export function LabsSwitch({ activeIcon, deactivatedIcon, slotProps, ...props }: SwitchProps & AdditionalProps) {
    return (
        <Switch
            {...props}
            slotProps={{
                thumb: ({ checked }) => ({
                    children: <FontAwesomeIcon icon={checked ? activeIcon ?? faCheck : deactivatedIcon ?? faTimes} style={{ width: 12, height: 12 }} />,
                }),
                ...slotProps
            }}
        />
    )
}