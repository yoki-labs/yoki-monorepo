import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { DefaultColorPalette, VariantProp } from "@mui/joy/styles/types";
import { ReactNode } from "react";

//#region Interfaces Form basic info structure
export interface LabsFormSection {
    name?: string;
    description?: string;
    row?: boolean;
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
}
//#endregion

//#region Interfaces Labs field common stuff
interface StyledLabsFormField {
    prefixIcon?: IconDefinition;
    size?: "sm" | "md" | "lg";
    variant?: VariantProp;
}

interface OptionedLabsFormField<
    TType extends LabsFormFieldType,
    TValue,
    TOptionValue = TValue
> extends BaseLabsFormField<TType, TValue> {
    selectableValues?: Array<{ name: string; value: TOptionValue; icon?: IconDefinition; }>;
}

interface PlaceholdableLabsFormField {
    placeholder?: string;
}
//#endregion

interface LabsFormFieldText<TType extends LabsFormFieldType> extends
    BaseLabsFormField<TType, string>,
    StyledLabsFormField,
    PlaceholdableLabsFormField
{}
interface LabsFormFieldSelectable<TType extends LabsFormFieldType> extends
    BaseLabsFormField<TType, string>,
    OptionedLabsFormField<TType, string, string>,
    StyledLabsFormField,
    PlaceholdableLabsFormField
{}

interface LabsFormFieldMultiSelection<TType extends LabsFormFieldType> extends
    BaseLabsFormField<TType, string[]>,
    OptionedLabsFormField<TType, string[], string>,
    StyledLabsFormField,
    PlaceholdableLabsFormField
{}

export type LabsFormFieldByType<T extends LabsFormFieldType> =
    T extends LabsFormFieldType.Text
    ? LabsFormFieldText<LabsFormFieldType>
    : T extends LabsFormFieldType.Select
    ? LabsFormFieldSelectable<LabsFormFieldType.Select>
    : T extends LabsFormFieldType.Toggle
    ? BaseLabsFormField<LabsFormFieldType.Toggle, boolean>
    : T extends LabsFormFieldType.MultiSelect
    ? LabsFormFieldMultiSelection<LabsFormFieldType.MultiSelect>
    : never;

export type LabsFormField =
    LabsFormFieldByType<LabsFormFieldType.Text> |
    LabsFormFieldByType<LabsFormFieldType.Select> |
    LabsFormFieldByType<LabsFormFieldType.Toggle> |
    LabsFormFieldByType<LabsFormFieldType.MultiSelect>
    ;

export enum LabsFormFieldType {
    Text,
    Select,
    Toggle,
    MultiSelect,
}