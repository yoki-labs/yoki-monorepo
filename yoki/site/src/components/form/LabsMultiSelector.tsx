import React, { ReactNode } from "react";
import { LabsFormFieldByType, LabsFormFieldType } from "./form";
import LabsForm, { FormFieldHeader } from "./LabsForm";
import { Chip, Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem, MenuList, Option, Select, SelectProps, Stack, Typography, styled } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import ClickAwayListener from "@mui/base/ClickAwayListener";

type Props = {
    field: LabsFormFieldByType<LabsFormFieldType.MultiSelect>;
    form: LabsForm;
    id: string;
};

type State = {
    values: string[];
};

export function LabsMultiSelectorShell({ children, valueDecorator, placeholder }: SelectProps<{}> & { valueDecorator?: ReactNode | undefined }) {
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <Dropdown disabled>
            <MenuButton onClick={() => setMenuOpen(!menuOpen)} endDecorator={<FontAwesomeIcon width="14px" icon={faAngleDown} />}>
                {valueDecorator || (
                    <Typography fontWeight="normal" sx={{ opacity: "50%" }}>
                        {placeholder}
                    </Typography>
                )}
            </MenuButton>
            <Menu open={menuOpen} onClose={setMenuOpen.bind(null, false)} placement="bottom">
                <ClickAwayListener onClickAway={setMenuOpen.bind(null, false)}>
                    <div>{children}</div>
                </ClickAwayListener>
            </Menu>
        </Dropdown>
    );
}

export default class LabsMultiSelector extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    get selectedValues() {
        const { field, form } = this.props;

        return (form.fieldValues[field.prop] ?? []) as string[];
    }

    setSelectedValues(values: string[]) {
        const { field, form } = this.props;

        return this.setState({ values: form.setValue(field, values) });
    }

    MultiSelectorMenuItems() {
        const { field } = this.props;
        const { selectedValues } = this;

        const menuItems = field.selectableValues?.map(({ value, name, disabled }) => {
            const isSelected = selectedValues.includes(value);

            return (
                <MenuItem disabled={disabled} onClick={() => this.setSelectedValues(isSelected ? selectedValues.filter((x) => x !== value) : selectedValues.concat(value))}>
                    <ListItemDecorator>{isSelected && <FontAwesomeIcon icon={faCheck} />}</ListItemDecorator>
                    {name}
                </MenuItem>
            );
        });

        return menuItems;
    }

    render() {
        const { id, field } = this.props;
        const { selectedValues } = this;
        const { selectableValues } = field;
        const selectedValueInfos = selectableValues?.filter((value) => selectedValues.includes(value.value));

        return (
            <>
                <FormFieldHeader field={field} />
                <LabsMultiSelectorShell
                    id={id}
                    disabled={field.disabled}
                    startDecorator={field.prefixIcon && <FontAwesomeIcon icon={field.prefixIcon} />}
                    placeholder={field.placeholder ?? `Select ${field.name?.toLowerCase() ?? "items"}`}
                    size={field.size ?? "md"}
                    valueDecorator={
                        selectedValueInfos?.length && (
                            <Stack direction="row" gap={1} alignItems="center">
                                {selectedValueInfos?.slice(0, 2).map(({ name }) => (
                                    <Chip variant="outlined" color="primary">
                                        {name}
                                    </Chip>
                                ))}
                                {(selectedValueInfos?.length ?? 0) > 2 && (
                                    <Typography level="body-sm" fontSize="sm">
                                        ...and {selectedValueInfos!.length - 2} more
                                    </Typography>
                                )}
                            </Stack>
                        )
                    }
                >
                    {this.MultiSelectorMenuItems()}
                </LabsMultiSelectorShell>
            </>
        );
    }
}
