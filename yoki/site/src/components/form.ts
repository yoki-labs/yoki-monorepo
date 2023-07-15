export interface LabsFormSection {
    name?: string;
    description?: string;
    row?: boolean;
    fields: LabsFormField[];
};

interface BaseLabsFormField<TType extends LabsFormFieldType, TValue> {
    // Functionality
    prop: string;
    type: TType;
    defaultValue?: TValue | undefined | null;
    // Display
    name: string;
    description?: string;
    // Config
    disabled?: boolean;
}
interface LabsFormFieldSelectable<TType extends LabsFormFieldType> extends BaseLabsFormField<TType, string> {
    selectableValues?: Array<{ name: string; value: string }>;
}

export type LabsFormFieldByType<T extends LabsFormFieldType> =
    T extends LabsFormFieldType.Toggle
    ? BaseLabsFormField<LabsFormFieldType.Toggle, boolean>
    : T extends LabsFormFieldType.Select
    ? LabsFormFieldSelectable<LabsFormFieldType.Select>
    : BaseLabsFormField<LabsFormFieldType, string>;

export type LabsFormField =
    LabsFormFieldByType<LabsFormFieldType.Text> |
    LabsFormFieldByType<LabsFormFieldType.Select> |
    LabsFormFieldByType<LabsFormFieldType.Toggle>;

export enum LabsFormFieldType {
    Text,
    Select,
    Toggle,
}