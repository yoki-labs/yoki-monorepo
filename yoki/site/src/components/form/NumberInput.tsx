import React from "react";
import LabsForm, { FormFieldHeader } from "./LabsForm";
import { LabsFormFieldByType, LabsFormFieldType } from "./form";
import { Button, ButtonGroup, Divider, IconButton, Input, Stack, VariantProp } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export type Props = {
    id: string;
    form: LabsForm;
    field: LabsFormFieldByType<LabsFormFieldType.Number>;
};
export type State = {
    isInvalid: boolean;
};

export default class NumberInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { isInvalid: false };
    }

    get currentValue() {
        const { field, form } = this.props;

        return (form.fieldValues[field.prop] ?? []) as number;
    }

    setValue(target: EventTarget & HTMLInputElement) {
        const { form, field } = this.props;
        const { max, min } = field;

        const currentValue = target.value === "-" ? -0 : Number(target.value);

        if (target.value !== "" && Number.isNaN(currentValue)) return this.setState({ isInvalid: true });
        // Don't allow 0.1, 1.1, etc. if it's not set as floating
        else if (!field.allowFloating && currentValue % 1) return this.setState({ isInvalid: true });
        // Just set the valid value instead of erroring out
        else if (typeof max === "number" && currentValue > max) form.setValue(field, max);
        else if (typeof min === "number" && currentValue < min) form.setValue(field, min);
        else form.setValue(field, target.value === "" ? null : currentValue);

        this.setState({ isInvalid: false });
    }

    addValue(value: number) {
        const { form, field } = this.props;
        const { currentValue } = this;

        form.setValue(field, currentValue + value);
        this.setState({});
    }

    render() {
        const { id, form, field } = this.props;
        const { max, min } = field;
        const { currentValue } = this;
        const step = field.step ?? 1;

        return (
            <>
                <FormFieldHeader field={field} />
                <Input
                    // Identification
                    id={id}
                    // type="number"
                    // Values
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue ?? undefined}
                    value={currentValue === -0 ? "-" : currentValue}
                    disabled={field.disabled}
                    slotProps={{
                        input: {
                            min: min,
                            max: max,
                        },
                    }}
                    onChange={({ target }) => this.setValue(target)}
                    // Display
                    size={field.size}
                    error={this.state.isInvalid}
                    variant={(field.variant as VariantProp | undefined) ?? "outlined"}
                    startDecorator={field.prefixIcon && <FontAwesomeIcon icon={field.prefixIcon} />}
                    endDecorator={
                        <>
                            <Divider orientation="vertical" sx={(theme) => ({ "--Divider-lineColor": theme.vars.palette.background.body })} />
                            <Stack direction="column">
                                <IconButton
                                    disabled={typeof field.max === "number" && currentValue >= field.max!}
                                    sx={{ border: "none", "--IconButton-size": "1.2rem", "--IconButton-radius": 0 }}
                                    variant="outlined"
                                    color="neutral"
                                    size="sm"
                                    onClick={() => this.addValue(step)}
                                >
                                    <FontAwesomeIcon icon={faChevronUp} style={{ width: 10, height: 10 }} />
                                </IconButton>
                                <IconButton
                                    disabled={typeof field.min === "number" && currentValue <= field.min!}
                                    sx={{ border: "none", "--IconButton-size": "1.2rem", "--IconButton-radius": 0 }}
                                    variant="outlined"
                                    color="neutral"
                                    size="sm"
                                    onClick={() => this.addValue(-step)}
                                >
                                    <FontAwesomeIcon icon={faChevronDown} style={{ width: 10, height: 10 }} />
                                </IconButton>
                            </Stack>
                        </>
                    }
                />
            </>
        );
    }
}
