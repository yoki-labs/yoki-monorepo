import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Box, Divider, ListItemDecorator, Option, Select, SelectOption, Typography } from "@mui/joy";
import React from "react";

import { LabsFormFieldByType, LabsFormFieldOption, LabsFormFieldType } from "./form";
import LabsForm, { FormFieldHeader } from "./LabsForm";

interface Props {
    field: LabsFormFieldByType<LabsFormFieldType.Select>;
    form: LabsForm;
    id: string;
}

interface State {
    value?: string | undefined | null;
}

export default class LabsSelector extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const { field } = props;

        this.state = { value: field.defaultValue as string | undefined | null };
    }

    renderOption(option: SelectOption<any> | null) {
        const { field } = this.props;
        const value = option && field.selectableValues && field.selectableValues?.find((selectableOption) => selectableOption.value === option.value);

        return value && this.renderValue(value);
    }

    renderValue(value: LabsFormFieldOption<string | boolean | number | null>) {
        return (
            <>
                {(value.icon || value.avatarIcon) && (
                    <ListItemDecorator sx={{ width: 28, marginRight: ".75rem" }}>
                        {value.icon && <FontAwesomeIcon icon={value.icon} />}
                        {value.avatarIcon && <Avatar size="sm" src={value.avatarIcon} />}
                    </ListItemDecorator>
                )}
                <Typography sx={{ color: value.color ? `#${value.color.toString(16)}` : "inherit" }}>
                    {value.name}
                </Typography>
            </>
        );
    }

    get selectedValues() {
        const { field, form } = this.props;

        return form.fieldValues[field.prop] as string;
    }

    setSelectedValue(value: string) {
        const { field, form } = this.props;

        return this.setState({ value: form.setValue(field, value) });
    }

    render() {
        const { id, form, field } = this.props;

        return (
            <>
                <FormFieldHeader field={field} />
                <Select
                    id={id}
                    defaultValue={field.defaultValue}
                    value={form.fieldValues[field.prop]}
                    placeholder={field.placeholder ?? `Select ${field.name?.toLowerCase() ?? "items"}`}
                    disabled={field.disabled}
                    onChange={(_, value) => this.setSelectedValue(value as string)}
                    startDecorator={field.prefixIcon && <FontAwesomeIcon icon={field.prefixIcon} />}
                    indicator={<FontAwesomeIcon width={14} height={14} icon={faAngleDown} />}
                    size={field.size ?? "md"}
                    renderValue={this.renderOption.bind(this)}
                    variant="outlined"
                >
                    {field.selectableValues?.map((value, i) => (
                        value.type === "divider"
                        ? <Divider sx={{ my: 1 }} />
                        : <Option key={`${id}.option-${i}`} disabled={value.disabled} value={value.value}>
                            {(value.icon || value.avatarIcon) && (
                                <ListItemDecorator sx={{ width: 40 }}>
                                    {value.icon && <FontAwesomeIcon icon={value.icon} />}
                                    {value.avatarIcon && <Avatar size="sm" src={value.avatarIcon} />}
                                </ListItemDecorator>
                            )}
                            <Box>
                                <Typography sx={{ color: value.color ? `#${value.color.toString(16)}` : "inherit" }}>
                                    {value.name}
                                </Typography>
                                {value.description && <Typography textColor="text.tertiary">{value.description}</Typography>}
                            </Box>
                        </Option>
                    ))}
                </Select>
            </>
        );
    }
}
