import React from "react";
import LabsForm, { FormFieldHeader } from "./LabsForm";
import { Alert, Avatar, Box, ColorPaletteProp, List, ListItem, ListItemButton, ListItemContent, ListItemDecorator, Typography, VariantProp } from "@mui/joy";
import { LabsFormFieldByType, LabsFormFieldOption, LabsFormFieldType } from "./form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

type Props = {
    field: LabsFormFieldByType<LabsFormFieldType.Picker>;
    form: LabsForm;
    id: string;
};

type State = {
    value?: string | boolean | number | undefined | null;
};

export default class LabsPicker extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const { field } = props;

        this.state = { value: field.defaultValue as string | number | undefined | null };
    }

    get selectedValue() {
        const { field, form } = this.props;

        return form.fieldValues[field.prop] as string | number | boolean | undefined | null;
    }

    setSelectedValue(value: string | number | boolean | undefined | null) {
        const { field, form } = this.props;

        return this.setState({ value: form.setValue(field, value) });
    }

    render() {
        const { id, field } = this.props;
        const value = this.selectedValue;

        return (
            <>
                <FormFieldHeader field={field} />
                <Box sx={{ overflowY: "scroll", maxHeight: field.height }}>
                    <List sx={{ paddingBlock: 0, "--ListItem-paddingY": "0.25rem", "--List-gap": "0.5rem", }} key={id}>
                        {field.selectableValues?.map((x) => (
                            <LabsPickerOption
                                variant={field.variant}
                                rightSideCheck={field.rightSideCheck}
                                // color={field.color}
                                option={x}
                                selected={x.value === value}
                                onClick={() => this.setSelectedValue(field.optional && x.value === value ? null : x.value)}
                            />
                        ))}
                    </List>
                </Box>
            </>
        );
    }
}

function LabsPickerOption({ variant, color, option, rightSideCheck, selected, onClick }: { variant?: VariantProp | "indented"; color?: ColorPaletteProp; rightSideCheck?: boolean; option: LabsFormFieldOption<string | boolean | number | null>; selected: boolean; onClick: () => unknown; }) {
    return (
        <ListItem>
            <ListItemButton variant={variant as VariantProp | undefined} color={color} onClick={onClick} sx={(theme) => ({ borderRadius: theme.vars.radius.sm })}>
                <ListItemDecorator>
                    {
                        rightSideCheck
                        // To allow null avatars
                        ? typeof option.avatarIcon !== "undefined"
                        ? <Avatar src={option.avatarIcon ?? undefined} size="sm" />
                        : <FontAwesomeIcon icon={option.icon!} />
                        : <LabsPickerOptionCheck selected={selected} />
                    }
                </ListItemDecorator>
                <ListItemContent>
                    <Typography level="title-md">{option.name}</Typography>
                    <Typography level="body-md">{option.description}</Typography>
                </ListItemContent>
                {rightSideCheck && <Box sx={{ ml: 1 }}>
                    <LabsPickerOptionCheck selected={selected} />
                </Box>}
            </ListItemButton>
        </ListItem>
    );
}

function LabsPickerOptionCheck({ selected }: { selected: boolean; }) {
    return (
        <Alert variant="soft" color={selected ? "success" : "neutral"} sx={{ width: 16, height: 16, p: 0.5, borderRadius: "100%" }}>
            <FontAwesomeIcon icon={faCheck} style={{ width: 16, height: 16, opacity: selected ? 1 : 0 }} />
        </Alert>
    );
}