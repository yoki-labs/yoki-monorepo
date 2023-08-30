import React from "react";
import LabsForm, { FormFieldHeader } from "./LabsForm";
import { Avatar, ListItemDecorator, Option, Select, SelectOption, Typography } from "@mui/joy";
import { LabsFormFieldByType, LabsFormFieldOption, LabsFormFieldType } from "./form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
    field: LabsFormFieldByType<LabsFormFieldType.Select>;
    form: LabsForm;
    id: string;
};

export default class LabsSelector extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    renderOption(option: SelectOption<any> | null) {
        const { field } = this.props;
        const value = option && field.selectableValues && field.selectableValues?.find((selectableOption) => selectableOption.value === option.value);

        return value && this.renderValue(value);
    }

    renderValue(value: LabsFormFieldOption<string | number>) {
        return (
            <>
                {((value.icon) && <ListItemDecorator sx={{ width: 20 }}>
                    {value.icon && <FontAwesomeIcon icon={value.icon} />}
                    {value.avatarIcon && <Avatar size="sm" src={value.avatarIcon} />}
                </ListItemDecorator>)}
                <Typography sx={{ color: value.color ? `#${value.color.toString(16)}` : "inherit" }}>
                    {value.name}  
                </Typography>
            </>
        );
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
                    onChange={(_, value) => value && form.setValue(field, value)}
                    startDecorator={field.prefixIcon && <FontAwesomeIcon icon={field.prefixIcon} />}
                    size={field.size ?? "md"}
                    renderValue={this.renderOption.bind(this)}
                >
                    {field.selectableValues?.map((value) => (
                        <Option disabled={value.disabled} value={value.value}>
                            {this.renderValue(value)}
                        </Option>
                    ))}
                </Select>
            </>
        )
    }
}