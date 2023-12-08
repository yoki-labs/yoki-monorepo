import React from "react";
import LabsForm, { FormFieldHeader } from "./LabsForm";
import { Alert, Box, List, ListItem, ListItemButton, ListItemDecorator, Typography } from "@mui/joy";
import { LabsFormFieldByType, LabsFormFieldOption, LabsFormFieldType } from "./form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

type Props = {
    field: LabsFormFieldByType<LabsFormFieldType.Picker>;
    form: LabsForm;
    id: string;
};

type State = {
    value?: string | number | undefined | null;
};

export default class LabsPicker extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const { field } = props;

        this.state = { value: field.defaultValue as string | number | undefined | null };
    }

    get selectedValue() {
        const { field, form } = this.props;

        return form.fieldValues[field.prop] as string | number | undefined | null;
    }

    setSelectedValue(value: string | number | undefined | null) {
        const { field, form } = this.props;

        return this.setState({ value: form.setValue(field, value) });
    }

    render() {
        const { id, field } = this.props;
        const value = this.selectedValue;

        return (
            <>
                <FormFieldHeader field={field} />
                <List sx={{ "--ListItem-paddingY": 0 }} key={id}>
                    {field.selectableValues?.map((x) => (
                        <LabsPickerOption option={x} selected={x.value === value} onClick={() => this.setSelectedValue(field.optional && x.value === value ? null : x.value)}  />
                    ))}
                </List>
            </>
        );
    }
}

function LabsPickerOption({ option, selected, onClick }: { option: LabsFormFieldOption<string | number>; selected: boolean; onClick: () => unknown; }) {
    return (
        <ListItem>
            <ListItemButton onClick={onClick}>
                <ListItemDecorator>
                    <Alert variant="soft" color={selected ? "success" : "neutral"} sx={{ width: 16, height: 16, p: 0.5, borderRadius: "100%" }}>
                        <FontAwesomeIcon icon={faCheck} style={{ width: 16, height: 16, opacity: selected ? 1 : 0 }} />
                    </Alert>
                </ListItemDecorator>
                <Box>
                    <Typography level="title-md">{option.name}</Typography>
                    <Typography level="body-md">{option.description}</Typography>
                </Box>
            </ListItemButton>
        </ListItem>
    );
}