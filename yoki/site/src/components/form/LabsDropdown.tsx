import { faAngleDown, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormControl, Select, selectClasses, SelectOwnProps } from "@mui/joy";

export default function LabsDropdown(props: SelectOwnProps<string, false>) {
    return (
        <FormControl>
            <Select
                variant="plain"
                sx={{
                    "--ListItemDecorator-size": "40px",
                    "--labs-palette-background-surface": "transparent",
                    [`& .${selectClasses.indicator}`]: {
                        transition: "0.2s",
                        [`&.${selectClasses.expanded}`]: {
                            transform: "rotate(-180deg)",
                        },
                    },
                }}
                slotProps={{
                    listbox: {
                        sx: {
                            "--ListItemDecorator-size": "40px",
                        },
                    },
                }}
                indicator={<FontAwesomeIcon width="14px" icon={faAngleDown} />}
                {...props}
            />
        </FormControl>
    );
}
