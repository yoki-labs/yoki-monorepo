import { FormControl } from "@mui/base";
import { Box, Button, Chip, FormHelperText, FormLabel, Input, ListItemDecorator, Option, Select, Stack, Typography } from "@mui/joy";
import React from "react";
import { FormEvent } from "react";
import LabsButton from "./LabsButton";
import { BaseLabsFormField, LabsFormField, LabsFormFieldByType, LabsFormFieldType, LabsFormSection } from "./form";
import LabsSwitch from "./LabsSwitch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type LabsFormFieldValue = string | boolean | undefined | null;

export type LabsFormProps = {
    sections: LabsFormSection[];
    children?: React.ReactElement | React.ReactElement[];
    onSubmit: (state: LabsFormState) => unknown;
    onCancel?: (state: LabsFormState) => unknown;
    canCancel?: boolean;
};

export type LabsFormState = {
    changed: boolean;
    values: Record<string, LabsFormFieldValue>;
};

export default class LabsForm extends React.Component<LabsFormProps, LabsFormState> {
    private formId: number;

    constructor(props: LabsFormProps) {
        super(props);

        const fields = this.props.sections.flatMap((section) => section.fields);
        this.state = {
            changed: false,
            values: fields.reduce<Record<string, LabsFormFieldValue>>((mapped, field) => ((mapped[field.prop] = field.defaultValue), mapped), {}),
        };

        this.formId = Math.floor(Math.random() * 75 + 25);
    }

    onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // To not be able to save again
        this.setState({ changed: false });

        return this.props.onSubmit(this.state);
    }

    onCancel(event: FormEvent<HTMLButtonElement>) {
        event.preventDefault();

        return this.props.onCancel?.(this.state);
    }

    setValue<T>(field: LabsFormField, value: T) {
        this.setState(({ values }) => ({ changed: true, values: Object.assign({}, values, { [field.prop]: value }) }));
    }

    render(): React.ReactNode {
        const onSubmit = this.onSubmit.bind(this);
        const onCancel = this.onCancel.bind(this);
        const { sections, children, canCancel } = this.props;
        const { changed } = this.state;

        return (
            <form id={`form-${this.formId}`} autoComplete="off" onSubmit={onSubmit}>
                {children}
                <Stack direction="column" gap={2}>
                    {sections.map((section) => (
                        <Box component="section">
                            {section.name && <Typography level="h2" fontSize="md">{section.name}</Typography>}
                            {section.description && <Typography level="body2">{section.description}</Typography>}
                            <Stack direction={section.row ? "row" : "column"} gap={2}>
                                {section.fields.map(this.generateField.bind(this))}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
                <Stack sx={{ mt: 2 }} direction="row" gap={1}>
                    <LabsButton disabled={!changed} variant="solid" color="primary" type="submit">
                        Save
                    </LabsButton>
                    { canCancel &&
                        <Button variant="outlined" onClick={onCancel} color="danger" type="submit">
                            Cancel
                        </Button> }
                </Stack>
            </form>
        );
    }

    generateField(field: LabsFormField) {
        const fieldId = `formfield-${this.formId}-${field.prop}`;

        return (
            <FormControl>
                {fieldRenderers[field.type](this, fieldId, field as never)}
                {field.description && <FormHelperText>{field.description}</FormHelperText>}
            </FormControl>
        );
    }
}

type FieldRendererRecord = {
    [T in LabsFormFieldType]: (form: LabsForm, id: string, field: LabsFormFieldByType<T>) => React.ReactElement;
}

export const fieldRenderers: FieldRendererRecord = {
    [LabsFormFieldType.Text]: (form, id, field) =>
        <>
            <LabsFormFieldHeader field={field} />
            <Input
                id={id}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue ?? void 0}
                size={field.size}
                disabled={field.disabled}
                onChange={({ target }) => form.setValue(field, target.value)}
                variant={field.variant ?? "outlined"}
                />
        </>,
    [LabsFormFieldType.Select]: (form, id, field) =>
        <>
            <LabsFormFieldHeader field={field} />
            <Select
                id={id}
                defaultValue={form.state.values[field.prop] ?? field.selectableValues?.[0]?.value}
                placeholder={`Select ${field.name?.toLowerCase() ?? "items"}`}
                disabled={field.disabled}
                onChange={(_, value) => value && form.setValue(field, value)}
                startDecorator={field.prefixIcon && <FontAwesomeIcon icon={field.prefixIcon} />}
            >
                {field.selectableValues?.map((value) => (
                    <Option value={value.value}>
                        {value.icon && <ListItemDecorator><FontAwesomeIcon icon={value.icon} /></ListItemDecorator>}
                        {value.name}
                    </Option>
                ))}
            </Select>
        </>,
    [LabsFormFieldType.Toggle]: (form, id, field) =>
        <Stack spacing={2} direction="row">
            <LabsFormFieldHeader field={field} />
            <Typography level="body1" fontWeight="bolder">{field.name}</Typography>
            <LabsSwitch
                id={id}
                defaultChecked={field.defaultValue ?? void 0}
                disabled={field.disabled}
                onChange={({ target }) => form.setValue(field, target.checked)}
                />
        </Stack>
};

function LabsFormFieldHeader({ field }: { field: BaseLabsFormField<LabsFormFieldType, any> }) {
    return (
        field.name
            ? <Stack spacing={1} direction="row">
                <FormLabel>{ field.name }</FormLabel>
                { field.badge && <Chip size="sm" variant="outlined" color={field.badge.color}>{ field.badge.text }</Chip> }
            </Stack>
            : null
    );
}