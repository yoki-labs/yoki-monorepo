import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { DefaultColorPalette, VariantProp } from "@mui/joy/styles/types";
import { ReactNode } from "react";

//#region Interfaces Form basic info structure
export interface LabsFormSection {
    name?: string;
    description?: string;
    row?: boolean;
    hideDivider?: boolean;
    gap?: number;
    start?: ReactNode;
    fields: LabsFormField[];
};

export interface BaseLabsFormField<TType extends LabsFormFieldType, TValue> {
    // Functionality
    prop: string;
    type: TType;
    defaultValue?: TValue | undefined | null;
    // Display
    name?: string;
    description?: string;
    badge?: { text: string, color: DefaultColorPalette };
    // Config
    disabled?: boolean;
    optional?: boolean;
}
//#endregion

//#region Interfaces Labs field common stuff
interface StyledLabsFormField {
    prefixIcon?: IconDefinition;
    size?: "sm" | "md" | "lg";
    variant?: VariantProp;
}

export interface LabsFormFieldOption<T> {
    name: string;
    value: T;
    icon?: IconDefinition;
    color?: number;
    avatarIcon?: string;
    disabled?: boolean;
}

interface OptionedLabsFormField<
    TType extends LabsFormFieldType,
    TValue,
    TOptionValue = TValue
> extends BaseLabsFormField<TType, TValue> {
    selectableValues?: Array<LabsFormFieldOption<TOptionValue>>;
}

interface PlaceholdableLabsFormField {
    placeholder?: string;
}
//#endregion

interface LabsFormFieldInput<TType extends LabsFormFieldType, TValue> extends
    BaseLabsFormField<TType, TValue>,
    StyledLabsFormField,
    PlaceholdableLabsFormField
{
    min?: number;
    max?: number;
}
interface LabsFormFieldSelectable<TType extends LabsFormFieldType> extends
    BaseLabsFormField<TType, string | number>,
    OptionedLabsFormField<TType, string | number, string | number>,
    StyledLabsFormField,
    PlaceholdableLabsFormField
{ }

interface LabsFormFieldMultiSelection<TType extends LabsFormFieldType> extends
    BaseLabsFormField<TType, string[]>,
    OptionedLabsFormField<TType, string[], string>,
    StyledLabsFormField,
    PlaceholdableLabsFormField
{}

export type LabsFormFieldByType<T extends LabsFormFieldType> =
    T extends LabsFormFieldType.Text
    ? LabsFormFieldInput<LabsFormFieldType.Text, string>
    : T extends LabsFormFieldType.Number
    ? LabsFormFieldInput<LabsFormFieldType.Number, number>
    : T extends LabsFormFieldType.Select
    ? LabsFormFieldSelectable<LabsFormFieldType.Select>
    : T extends LabsFormFieldType.Toggle
    ? BaseLabsFormField<LabsFormFieldType.Toggle, boolean>
    : T extends LabsFormFieldType.MultiSelect
    ? LabsFormFieldMultiSelection<LabsFormFieldType.MultiSelect>
    : never;

export type LabsFormField =
    LabsFormFieldByType<LabsFormFieldType.Text> |
    LabsFormFieldByType<LabsFormFieldType.Number> |
    LabsFormFieldByType<LabsFormFieldType.Select> |
    LabsFormFieldByType<LabsFormFieldType.Toggle> |
    LabsFormFieldByType<LabsFormFieldType.MultiSelect>
    ;

export enum LabsFormFieldType {
    Text,
    Number,
    Select,
    Toggle,
    MultiSelect,
}