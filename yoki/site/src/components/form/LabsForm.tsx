import { Box, Button, Chip, Divider, FormControl, FormHelperText, FormLabel, Input, Stack, Switch, Textarea, Typography } from "@mui/joy";
import React from "react";
import { FormEvent } from "react";
import { BaseLabsFormField, LabsFormField, LabsFormFieldByType, LabsFormFieldType, LabsFormSection, LabsFormSectionOrder } from "./form";
import LabsMultiSelector from "./LabsMultiSelector";
import LabsSelector from "./LabsSelector";
import NumberInput from "./NumberInput";
import TimeInput from "./TimeInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LabsPicker from "./LabsPicker";

type LabsFormFieldValue = string | string[] | number | boolean | undefined | null;

export type LabsFormFieldValueMap = Record<string, LabsFormFieldValue>;

export type LabsFormProps = {
    sections: LabsFormSection[];
    children?: React.ReactElement | React.ReactElement[];

    // Actions
    alwaysDisplayActions?: boolean;
    resetOnSubmission?: boolean;

    onSubmit: (values: LabsFormFieldValueMap) => unknown;
    submitText?: string;

    onCancel?: (state: LabsFormState) => unknown;
};

type LabsFormState = {
    changed: boolean;
    // values: Record<string, LabsFormFieldValue>;
};

export default class LabsForm extends React.Component<LabsFormProps, LabsFormState> {
    private formId: number;
    // Do not use state for performance reasons
    public fieldValues: Record<string, LabsFormFieldValue>;

    constructor(props: LabsFormProps) {
        super(props);

        this.state = {
            changed: false,
        };

        this.formId = Math.floor(Math.random() * 75 + 25);

        this.fieldValues = this.defaultFieldValues;
    }

    get fields() {
        return this.props.sections.flatMap((x) => x.fields);
    }

    get defaultFieldValues() {
        return this.fields.reduce<Record<string, LabsFormFieldValue>>((mapped, field) => ((mapped[field.prop] = field.defaultValue ?? null), mapped), {});
    }

    get displayActions() {
        const { alwaysDisplayActions } = this.props;
        const { changed } = this.state;

        return alwaysDisplayActions || changed;
    }

    onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const oldValues = this.fieldValues;

        // For things like log channel creations
        if (this.props.resetOnSubmission) this.fieldValues = this.defaultFieldValues;

        // To not be able to save again
        this.setState({ changed: false });

        return this.props.onSubmit(oldValues);
    }

    onCancel(event: FormEvent<HTMLButtonElement>) {
        event.preventDefault();

        return this.props.onCancel?.(this.state);
    }

    setValue<T>(field: LabsFormField, value: T) {
        const { changed } = this.state;

        // this.setState(({ values }) => ({ changed: true, values: Object.assign({}, values, { [field.prop]: value }) }));
        this.fieldValues = Object.assign({}, this.fieldValues, { [field.prop]: value });

        if (!changed) this.setState({ changed: true });

        return value;
    }

    render(): React.ReactNode {
        const onSubmit = this.onSubmit.bind(this);
        const { sections, children, submitText, onCancel } = this.props;
        const { changed } = this.state;
        const { displayActions } = this;

        return (
            <form id={`form-${this.formId}`} autoComplete="off" onSubmit={onSubmit}>
                {children}
                <Stack direction="column" gap={3}>
                    {sections.map((section, i) => (
                        <Box component="section">
                            {i > 0 && !section.hideDivider && <Divider sx={{ mb: 2 }} />}
                            {section.name && (
                                <Typography level="h2" fontSize="lg" sx={{ mb: 2 }}>
                                    {section.name}
                                </Typography>
                            )}
                            {section.description && <Typography level="body-md">{section.description}</Typography>}
                            <Box gap={section.gap ?? 2} className={sectionOrderCss[section.order ?? LabsFormSectionOrder.Column]}>
                                {section.start}
                                {section.fields.map(this.generateField.bind(this))}
                            </Box>
                        </Box>
                    ))}
                </Stack>
                {displayActions && (
                    <Stack sx={{ mt: 2 }} direction="row" gap={1}>
                        <Button disabled={!changed} variant="outlined" color="primary" type="submit">
                            {submitText ?? "Save"}
                        </Button>
                        {onCancel && (
                            <Button variant="plain" onClick={this.onCancel.bind(this)} color="neutral" type="submit">
                                Cancel
                            </Button>
                        )}
                    </Stack>
                )}
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

const sectionOrderCss: Record<LabsFormSectionOrder, string> = {
    [LabsFormSectionOrder.Column]: `flex flex-col`,
    [LabsFormSectionOrder.Row]: `flex flex-col md:flex-row`,
    [LabsFormSectionOrder.Grid]: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xlg:grid-cols-4`,
};

type FieldRendererRecord = {
    [T in LabsFormFieldType]: (form: LabsForm, id: string, field: LabsFormFieldByType<T>) => React.ReactElement;
};

export const fieldRenderers: FieldRendererRecord = {
    [LabsFormFieldType.Text]: (form, id, field) => (
        <>
            <FormFieldHeader field={field} />
            <Input
                id={id}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue ?? void 0}
                size={field.size}
                disabled={field.disabled}
                onChange={({ target }) => form.setValue(field, target.value)}
                variant={field.variant ?? "outlined"}
                startDecorator={field.prefixIcon && <FontAwesomeIcon icon={field.prefixIcon} />}
            />
        </>
    ),
    [LabsFormFieldType.TextArea]: (form, id, field) => (
        <>
            <FormFieldHeader field={field} />
            <Textarea
                id={id}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue ?? void 0}
                size={field.size}
                disabled={field.disabled}
                onChange={({ target }) => form.setValue(field, target.value)}
                variant={field.variant ?? "outlined"}
                minRows={field.minRows}
            />
        </>
    ),
    [LabsFormFieldType.Number]: (form, id, field) => <NumberInput id={id} form={form} field={field} />,
    [LabsFormFieldType.Time]: (form, id, field) => <TimeInput id={id} form={form} field={field} />,
    [LabsFormFieldType.Select]: (form, id, field) => <LabsSelector id={id} form={form} field={field} />,
    [LabsFormFieldType.Picker]: (form, id, field) => <LabsPicker id={id} form={form} field={field} />,
    [LabsFormFieldType.Toggle]: (form, id, field) => (
        <Stack spacing={2} direction="row">
            <FormFieldHeader field={field} />
            <Switch id={id} defaultChecked={field.defaultValue ?? void 0} disabled={field.disabled} onChange={({ target }) => form.setValue(field, target.checked)} />
        </Stack>
    ),
    [LabsFormFieldType.MultiSelect]: (form, id, field) => <LabsMultiSelector id={id} form={form} field={field} />,
};

export function FormFieldHeader({ field }: { field: BaseLabsFormField<LabsFormFieldType, any> }) {
    return field.name ? (
        <Stack spacing={1} direction="row" sx={{ mb: 1 }}>
            <FormLabel sx={{ fontWeight: "normal" }}>
                <Typography level="title-md">{field.name}</Typography>
            </FormLabel>
            {field.badge && (
                <Chip size="sm" variant="outlined" color={field.badge.color}>
                    {field.badge.text}
                </Chip>
            )}
        </Stack>
    ) : null;
}
