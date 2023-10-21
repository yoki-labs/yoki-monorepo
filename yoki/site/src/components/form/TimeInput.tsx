import React, { ChangeEventHandler } from "react";
import LabsForm, { FormFieldHeader } from "./LabsForm";
import { LabsFormFieldByType, LabsFormFieldType, TimeStep } from "./form";
import { ColorPaletteProp, Input, Stack, Typography } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { ascendingTimeUnits, insertTime, maxValues, unitToMs } from "./time-util";
import { InputWrapper } from "./CustomInput";

export type Props = {
    id: string;
    form: LabsForm;
    field: LabsFormFieldByType<LabsFormFieldType.Time>;
};
export type State = {
    isInvalid: boolean;
};

function TimeInputShellMiniInput({
    value,
    color,
    suffix,
    onChange,
}: {
    value: number | undefined;
    color: ColorPaletteProp;
    max?: number;
    suffix: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}) {
    return (
        <Input
            placeholder="00"
            color={color}
            variant="soft"
            endDecorator={
                <Typography level="body-md" textColor={`${color}.200`} sx={{ userSelect: "none" }}>
                    {suffix}
                </Typography>
            }
            slotProps={{
                input: {
                    style: { width: "2em" },
                },
            }}
            value={value || ""}
            onChange={onChange}
        />
    );
}

function TimeInputShell({ value, color, timeStep, onChange }: { value: number | undefined; color: ColorPaletteProp; timeStep: TimeStep; onChange: (value: number) => unknown }) {
    const secondStep = (timeStep - 1) as TimeStep;

    return (
        <Stack direction="row" alignItems="center" sx={{ flex: "1" }}>
            <TimeInputShellMiniInput
                value={value && Math.floor(value / unitToMs[timeStep])}
                suffix={ascendingTimeUnits[timeStep]}
                color={color}
                onChange={({ target }) => onModifiedSubInput(target, value, timeStep, onChange)}
                max={maxValues[timeStep]}
            />
            <Typography level="body-lg" textColor={`${color}.300`} sx={{ userSelect: "none" }}>
                :
            </Typography>
            <TimeInputShellMiniInput
                value={value && Math.floor((value % unitToMs[timeStep]) / unitToMs[secondStep])}
                suffix={ascendingTimeUnits[secondStep]}
                color={color}
                onChange={({ target }) => onModifiedSubInput(target, value, secondStep, onChange)}
                max={maxValues[secondStep]}
            />
        </Stack>
    );
}

function onModifiedSubInput(target: EventTarget & HTMLInputElement, existingValue: number | undefined, step: TimeStep, onChange: (value: number) => unknown) {
    if (isNaN(target.value as unknown as number)) return onChange(NaN);

    // To allow validating text inputs, since invalid type="number" doesn't allow making the input red, for instance
    const parsed = parseInt(target.value, 10) || 0;
    const maxValue = maxValues[step];

    return parsed < maxValue ? onChange(insertTime(existingValue ?? 0, parsed, step)) : onChange(insertTime(existingValue ?? 0, maxValue - 1, step));
}

export default class TimeInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { isInvalid: false };
    }

    get currentValue() {
        const { field, form } = this.props;

        return (form.fieldValues[field.prop] ?? void 0) as number | undefined;
    }

    setValue(value: number) {
        const { form, field } = this.props;
        const { max, min } = field;

        if (Number.isNaN(value)) return this.setState({ isInvalid: true });

        // Just set the valid value instead of erroring out
        if (typeof max === "number" && value > max) form.setValue(field, max);
        else if (typeof min === "number" && value < min) form.setValue(field, min);
        else form.setValue(field, value);

        this.setState({ isInvalid: false });
    }

    addValue(value: number) {
        const { form, field } = this.props;
        const { currentValue } = this;

        form.setValue(field, (currentValue ?? 0) + value);
        this.setState({});
    }

    render() {
        const { field } = this.props;
        const { currentValue } = this;

        const color = this.state.isInvalid ? "danger" : "neutral";

        return (
            <>
                <FormFieldHeader field={field} />
                <InputWrapper color={color}>
                    <TimeInputShell timeStep={field.step ?? TimeStep.Minutes} value={currentValue} color={color} onChange={this.setValue.bind(this)} />
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: 12 }} />
                </InputWrapper>
            </>
        );
    }
}
