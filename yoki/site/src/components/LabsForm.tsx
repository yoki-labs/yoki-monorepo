import { FormControl } from "@mui/base";
import { FormGroup, FormHelperText, FormLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import React from "react";
import { FormEvent } from "react";
import LabsButton from "./LabsButton";

export type LabsFormProps = {
    sections: LabsFormSection[];
    children?: React.ReactElement | React.ReactElement[];
    onSubmit: (state: LabsFormState) => unknown;
};

export type LabsFormSection = {
    name?: string;
    description?: string;
    row?: boolean;
    fields: LabsFormField[];
};

export interface LabsFormField {
    // Functionality
    prop: string;
    type: LabsFormFieldType;
    value?: string;
    values?: Array<{ name: string; value: string }>;
    // Display
    name: string;
    description?: string;
}

export enum LabsFormFieldType {
    Text,
    Select,
}

export type LabsFormState = {
    changed: boolean;
    values: Record<string, string | undefined>;
};

export default class LabsForm extends React.Component<LabsFormProps, LabsFormState> {
    private formId: number;

    constructor(props: LabsFormProps) {
        super(props);

        const fields = this.props.sections.flatMap((section) => section.fields);
        this.state = {
            changed: false,
            values: fields.reduce<Record<string, string | undefined>>((mapped, field) => ((mapped[field.prop] = field.value), mapped), {}),
        };

        this.formId = Math.floor(Math.random() * 75 + 25);
    }

    onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // To not be able to save again
        this.setState({ changed: false });

        return this.props.onSubmit(this.state);
    }

    setValue(field: LabsFormField, value: string) {
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
                    <FormGroup row={section.row}>{section.fields.map(this.generateField.bind(this))}</FormGroup>
                ))}
                <LabsButton disabled={!changed} variant="contained" color="primary" type="submit">
                    Save
                </LabsButton>
            </form>
        );
    }

    generateField(field: LabsFormField) {
        const fieldId = `formfield-${this.formId}-${field.prop}`;

        return (
            <FormControl fullWidth>
                {field.type === LabsFormFieldType.Select ? (
                    <>
                        <Select
                            id={fieldId}
                            value={this.state.values[field.prop] ?? field.values?.[0]?.value}
                            label={field.name}
                            onChange={({ target: { value } }) => this.setValue(field, value)}
                        >
                            {field.values?.map((value) => (
                                <MenuItem value={value.value}>{value.name}</MenuItem>
                            ))}
                        </Select>
                    </>
                ) : (
                    <TextField id={fieldId} label={field.name} onChange={({ target: { value } }) => this.setValue(field, value)} variant="outlined" />
                )}
                {field.description && <FormHelperText>{field.description}</FormHelperText>}
            </FormControl>
        );
    }
}
