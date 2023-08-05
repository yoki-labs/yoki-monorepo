import { Box, Button, Chip, FormControl, FormHelperText, FormLabel, Input, Stack, Typography } from "@mui/joy";
import React from "react";
import { FormEvent } from "react";
import { BaseLabsFormField, LabsFormField, LabsFormFieldByType, LabsFormFieldType, LabsFormSection } from "./form";
import LabsSwitch from "./LabsSwitch";
import LabsMultiSelector from "./LabsMultiSelector";
import LabsSelector from "./LabsSelector";

type LabsFormFieldValue = string | string[] | number | boolean | undefined | null;

export type LabsFormProps = {
    sections: LabsFormSection[];
    children?: React.ReactElement | React.ReactElement[];

    // Actions
    alwaysDisplayActions?: boolean;

    onSubmit: (state: LabsFormState) => unknown;
    submitText?: string;

    onCancel?: (state: LabsFormState) => unknown;
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
            values: fields.reduce<Record<string, LabsFormFieldValue>>((mapped, field) => ((mapped[field.prop] = field.defaultValue ?? null), mapped), {}),
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
        const { sections, children, submitText, alwaysDisplayActions, onCancel } = this.props;
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
                                {section.start}
                                {section.fields.map(this.generateField.bind(this))}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
                {(alwaysDisplayActions || changed) && <Stack sx={{ mt: 2 }} direction="row" gap={1}>
                    <Button disabled={!changed} variant="outlined" color="success" type="submit">
                        {submitText ?? "Save"}
                    </Button>
                    { onCancel &&
                        <Button variant="outlined" onClick={this.onCancel.bind(this)} color="neutral" type="submit">
                            Cancel
                        </Button> }
                </Stack>}
            </form>
        );
    }

    generateField(field: LabsFormField) {
        const fieldId = `formfield-${this.formId}-${field.prop}`;

        return (
            <FormControl sx={{ opacity: field.disabled ? 0.4 : 1 }}>
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
    [LabsFormFieldType.Number]: (form, id, field) =>
        <>
            <LabsFormFieldHeader field={field} />
            <Input
                id={id}
                type="number"
                placeholder={field.placeholder}
                defaultValue={field.defaultValue ?? void 0}
                size={field.size}
                disabled={field.disabled}
                onChange={({ target }) => form.setValue(field, target.value)}
                variant={field.variant ?? "outlined"}
                />
        </>,
    [LabsFormFieldType.Select]: (form, id, field) =>
        <LabsSelector
            id={id}
            form={form}
            field={field}
            />,
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
        </Stack>,
    [LabsFormFieldType.MultiSelect]: (form, id, field) =>
        <LabsMultiSelector
            id={id}
            form={form}
            field={field}
        />,
};

export function LabsFormFieldHeader({ field }: { field: BaseLabsFormField<LabsFormFieldType, any> }) {
    return (
        field.name
            ? <Stack spacing={1} direction="row">
                <FormLabel>{ field.name }</FormLabel>
                { field.badge && <Chip size="sm" variant="outlined" color={field.badge.color}>{ field.badge.text }</Chip> }
            </Stack>
            : null
    );
}