import { DefaultColorPalette } from "@mui/joy/styles/types";

export interface LabsFormSection {
    name?: string;
    description?: string;
    row?: boolean;
    fields: LabsFormField[];
};

export interface BaseLabsFormField<TType extends LabsFormFieldType, TValue> {
    // Functionality
    prop: string;
    type: TType;
    defaultValue?: TValue | undefined | null;
    // Display
    name: string;
    description?: string;
    badge?: { text: string, color: DefaultColorPalette };
    // Config
    disabled?: boolean;
}
interface LabsFormFieldText<TType extends LabsFormFieldType> extends BaseLabsFormField<TType, string> {
    placeholder: string;
}
interface LabsFormFieldSelectable<TType extends LabsFormFieldType> extends BaseLabsFormField<TType, string> {
    selectableValues?: Array<{ name: string; value: string }>;
}

export type LabsFormFieldByType<T extends LabsFormFieldType> =
    T extends LabsFormFieldType.Toggle
    ? BaseLabsFormField<LabsFormFieldType.Toggle, boolean>
    : T extends LabsFormFieldType.Select
    ? LabsFormFieldSelectable<LabsFormFieldType.Select>
    : LabsFormFieldText<LabsFormFieldType>;

export type LabsFormField =
    LabsFormFieldByType<LabsFormFieldType.Text> |
    LabsFormFieldByType<LabsFormFieldType.Select> |
    LabsFormFieldByType<LabsFormFieldType.Toggle>;

export enum LabsFormFieldType {
    Text,
    Select,
    Toggle,
}