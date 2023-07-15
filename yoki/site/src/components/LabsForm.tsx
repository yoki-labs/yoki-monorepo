import { FormControl } from "@mui/base";
import { FormHelperText, Input, Option, Select, Stack, Typography } from "@mui/joy";
import React from "react";
import { FormEvent } from "react";
import LabsButton from "./LabsButton";
import { LabsFormField, LabsFormFieldByType, LabsFormFieldType, LabsFormSection } from "./form";
import LabsSwitch from "./LabsSwitch";

type LabsFormFieldValue = string | boolean | undefined | null;

export type LabsFormProps = {
    sections: LabsFormSection[];
    children?: React.ReactElement | React.ReactElement[];
    onSubmit: (state: LabsFormState) => unknown;
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

    setValue<T>(field: LabsFormField, value: T) {
        this.setState(({ values }) => ({ changed: true, values: Object.assign({}, values, { [field.prop]: value }) }));
    }

    render(): React.ReactNode {
        const onSubmit = this.onSubmit.bind(this);
        const { sections, children } = this.props;
        const { changed } = this.state;

        return (
            <form id={`form-${this.formId}`} autoComplete="off" onSubmit={onSubmit}>
                {children}
                {sections.map((section) => (
                    <section>{section.fields.map(this.generateField.bind(this))}</section>
                ))}
                <LabsButton disabled={!changed} variant="solid" color="primary" type="submit">
                    Save
                </LabsButton>
            </form>
        );
    }

    generateField(field: LabsFormField) {
        const fieldId = `formfield-${this.formId}-${field.prop}`;

        return (
            <FormControl className="mb-6">
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
        <Input id={id} placeholder={field.name} defaultValue={field.defaultValue ?? void 0} disabled={field.disabled} onChange={({ target }) => form.setValue(field, target.value)} variant="outlined" />,
    [LabsFormFieldType.Select]: (form, id, field) =>
        <>
            <Select
                id={id}
                defaultValue={form.state.values[field.prop] ?? field.selectableValues?.[0]?.value}
                placeholder={field.name}
                disabled={field.disabled}
                onChange={(_, value) => value && form.setValue(field, value)}
            >
                {field.selectableValues?.map((value) => (
                    <Option value={value.value}>{value.name}</Option>
                ))}
            </Select>
        </>,
    [LabsFormFieldType.Toggle]: (form, id, field) =>
        <Stack spacing={2} direction="row">
            <Typography level="body1" fontWeight="bolder">{field.name}</Typography>
            <LabsSwitch
                id={id}
                defaultChecked={field.defaultValue ?? void 0}
                disabled={field.disabled}
                onChange={({ target }) => form.setValue(field, target.checked)}
                />
        </Stack>
};
