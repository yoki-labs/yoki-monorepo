import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { DefaultColorPalette, VariantProp } from "@mui/joy/styles/types";
import { ReactNode } from "react";

// Enums
export enum TimeStep {
    Seconds = 0,
    Minutes = 1,
    Hours = 2,
    Days = 3,
}
export enum LabsFormSectionOrder {
    Column = 0,
    Row = 1,
    GridSm = 2,
    Grid = 3,
}

// #region Interfaces Form basic info structure
export interface LabsFormSection {
    name?: string;
    description?: string;
    order?: LabsFormSectionOrder;
    hideDivider?: boolean;
    gap?: number;
    start?: ReactNode;
    fields: LabsFormField[];
}

export interface BaseLabsFormField<TType extends LabsFormFieldType, TValue> {
    // Functionality
    prop: string;
    type: TType;
    defaultValue?: TValue | undefined | null;
    // Display
    name?: string;
    subtitle?: string;
    description?: string;
    badge?: { text: string; color: DefaultColorPalette };
    // Config
    disabled?: boolean;
    optional?: boolean;
}
// #endregion

// #region Interfaces Labs field common stuff
interface StyledLabsFormField {
    prefixIcon?: IconDefinition;
    size?: "sm" | "md" | "lg";
    variant?: VariantProp;
}

export interface LabsFormFieldOption<T> {
    name: string;
    description?: string;
    value: T;
    icon?: IconDefinition;
    color?: number;
    avatarIcon?: string | null;
    disabled?: boolean;
}

interface OptionedLabsFormField<TType extends LabsFormFieldType, TValue, TOptionValue = TValue> extends BaseLabsFormField<TType, TValue> {
    selectableValues?: Array<LabsFormFieldOption<TOptionValue>>;
}

interface PlaceholdableLabsFormField {
    placeholder?: string;
}
// #endregion

interface LabsFormFieldInput<TType extends LabsFormFieldType, TValue> extends BaseLabsFormField<TType, TValue>, StyledLabsFormField, PlaceholdableLabsFormField {
    min?: number;
    max?: number;
}

interface LabsFormFieldNumberInput<TType extends LabsFormFieldType> extends LabsFormFieldInput<TType, number> {
    step?: number;
    allowFloating?: boolean;
}
interface LabsFormFieldInputLarge<TType extends LabsFormFieldType, TValue> extends LabsFormFieldInput<TType, TValue> {
    minRows?: number;
}
interface LabsFormFieldSelectable<TType extends LabsFormFieldType>
    extends BaseLabsFormField<TType, string | boolean | number | null>,
        OptionedLabsFormField<TType, string | boolean | number | null, string | boolean | number | null>,
        StyledLabsFormField,
        PlaceholdableLabsFormField { }

interface LabsFormFieldMultiSelection<TType extends LabsFormFieldType>
    extends BaseLabsFormField<TType, string[]>,
        OptionedLabsFormField<TType, string[], string>,
        StyledLabsFormField,
        PlaceholdableLabsFormField {}

interface LabsFormFieldPicker<TType extends LabsFormFieldType> extends LabsFormFieldSelectable<TType> {
    rightSideCheck?: boolean;
    height?: number;
}

interface LabsFormFieldTimed<TType extends LabsFormFieldType> extends BaseLabsFormField<TType, number>, StyledLabsFormField {
    step?: TimeStep;
    max?: number;
    min?: number;
}

export type LabsFormFieldByType<T extends LabsFormFieldType> =
    // Text-based inputs
    T extends LabsFormFieldType.Text
        ? LabsFormFieldInput<LabsFormFieldType.Text, string>
        : T extends LabsFormFieldType.TextArea
        ? LabsFormFieldInputLarge<LabsFormFieldType.TextArea, string>
        : T extends LabsFormFieldType.Number
        ? LabsFormFieldNumberInput<LabsFormFieldType.Number>
        : // Navigatable/semi text-based inputs
        T extends LabsFormFieldType.Time
        ? LabsFormFieldTimed<LabsFormFieldType.Time>
        : // Selection
        T extends LabsFormFieldType.Select
        ? LabsFormFieldSelectable<LabsFormFieldType.Select>
        : T extends LabsFormFieldType.Picker
        ? LabsFormFieldPicker<LabsFormFieldType.Picker>
        : T extends LabsFormFieldType.Toggle
        ? BaseLabsFormField<LabsFormFieldType.Toggle, boolean>
        : T extends LabsFormFieldType.MultiSelect
        ? LabsFormFieldMultiSelection<LabsFormFieldType.MultiSelect>
        : // Never
          never;

export type LabsFormField =
    // Text-based inputs
    | LabsFormFieldByType<LabsFormFieldType.Text>
    | LabsFormFieldByType<LabsFormFieldType.TextArea>
    | LabsFormFieldByType<LabsFormFieldType.Number>
    // Navigatable/semi text-based inputs
    | LabsFormFieldByType<LabsFormFieldType.Time>
    // Selection
    | LabsFormFieldByType<LabsFormFieldType.Select>
    | LabsFormFieldByType<LabsFormFieldType.Picker>
    | LabsFormFieldByType<LabsFormFieldType.Toggle>
    | LabsFormFieldByType<LabsFormFieldType.MultiSelect>;

export enum LabsFormFieldType {
    Text,
    TextArea,
    Number,
    Select,
    Picker,
    Toggle,
    MultiSelect,
    Time,
}
