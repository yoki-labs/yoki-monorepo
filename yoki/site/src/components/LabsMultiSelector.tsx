import React, { ReactNode } from "react";
import { LabsFormFieldByType, LabsFormFieldType } from "./form";
import LabsForm, { LabsFormFieldHeader } from "./LabsForm";
import { Chip, ListItemDecorator, Menu, MenuItem, Option, Select, SelectProps, Stack, Typography, styled } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

type Props = {
    field: LabsFormFieldByType<LabsFormFieldType.MultiSelect>;
    form: LabsForm;
    id: string;
};

export function LabsMultiSelectorShell({ id, children, valueDecorator, placeholder, ...otherProps }: SelectProps<{}> & { valueDecorator?: ReactNode | undefined }) {
    const selectorRef = React.useRef(null);
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <>
            <Select
                variant="outlined"
                color="neutral"
                ref={selectorRef}
                aria-haspopup={true}
                aria-expanded={menuOpen || void 0}
                onClick={setMenuOpen.bind(null, true)}
                // Overrides
                sx={{ opacity: valueDecorator ? 1 : 0.5 }}
                placeholder={valueDecorator ?? placeholder}
                {...otherProps}
                // Don't care about the override
                id={`${id}-button`}
            />
            <Menu
                id={`${id}-menu`}
                anchorEl={selectorRef.current}
                open={menuOpen}
                onClose={setMenuOpen.bind(null, false)}
                placement="bottom"
                sx={{ height: 200 }}
            >
                {children}
            </Menu>
        </>
    )
}

export default class LabsMultiSelector extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    get selectedValues() {
        const { field, form } = this.props;

        return (form.state.values[field.prop] ?? []) as string[];
    }

    setSelectedValues(values: string[]) {
        const { field, form } = this.props;

        return form.setValue(field, values);
    }

    MultiSelectorMenuItems() {
        const { field } = this.props;
        const { selectedValues } = this;

        return (
            <>
                {field.selectableValues?.map(({ value, name }) => {
                    const isSelected = selectedValues.includes(value);

                    return (
                        <MenuItem onClick={() => this.setSelectedValues(isSelected ? selectedValues.filter((x) => x !== value) : selectedValues.concat(value))}>
                            <ListItemDecorator>
                                {isSelected && <FontAwesomeIcon icon={faCheck} />}
                            </ListItemDecorator>
                            {name}
                        </MenuItem>
                    );
                })}
            </>
        );
    }

    render() {
        const { id, field } = this.props;
        const { selectedValues } = this;
        const { selectableValues } = field;
        const selectedValueInfos = selectableValues?.filter((value) => selectedValues.includes(value.value));
        const MultiSelectorMenuItems = this.MultiSelectorMenuItems.bind(this);

        return (
            <>
                <LabsFormFieldHeader field={field} />
                <LabsMultiSelectorShell
                    id={id}
                    disabled={field.disabled}
                    startDecorator={field.prefixIcon && <FontAwesomeIcon icon={field.prefixIcon} />}
                    placeholder={field.placeholder ?? `Select ${field.name?.toLowerCase() ?? "items"}`}
                    size={field.size ?? "md"}
                    valueDecorator={
                        <Stack direction="row" gap={1} alignItems="center">
                            {selectedValueInfos?.slice(0, 2).map(({ name }) => <Chip variant="outlined" color="primary">{name}</Chip>)}
                            {(selectedValueInfos?.length ?? 0) > 2 && <Typography fontSize="sm">...and {selectedValueInfos!.length - 2} more</Typography>}
                        </Stack>
                    }>
                    <MultiSelectorMenuItems />
                </LabsMultiSelectorShell>
            </>
        );
    }
}