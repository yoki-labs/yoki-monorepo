import { faCheck, faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Chip, IconButton, Input, InputProps, Stack, Typography } from "@mui/joy";
import React from "react";

type Props = InputProps & {
    text: string | number;
};
type State = {
    copied: boolean;
};

export class LabsCopyInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { copied: false };
    }

    copyText() {
        const { text } = this.props;

        // Copy
        navigator.clipboard.writeText(text.toString());

        // Feedback; let user know they copied the text
        this.setState({ copied: true });
    }

    render() {
        const { text } = this.props;
        const { copied } = this.state;

        const color = copied ? "success" : "primary";

        return (
            <Input
                slots={{
                    input: Stack,
                }}
                slotProps={{
                    input: {
                        children: <Typography level="inline-code">{text}</Typography>,
                        direction: "row",
                        alignItems: "center",
                        gap: 2,
                    },
                }}
                endDecorator={
                    <Button
                        variant="soft"
                        color={color}
                        // sx={(theme) => ({
                        //     backgroundColor: `${theme.vars.palette[color][copied ? 900 : 700]} !important`,
                        //     ":hover": {
                        //         backgroundColor: `${theme.vars.palette[color][copied ? 800 : 600]} !important`,
                        //     },
                        // })}
                        onClick={this.copyText.bind(this)}
                        startDecorator={<FontAwesomeIcon icon={copied ? faCheck : faClipboard} />}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </Button>
                }
                {...this.props}
            />
        );
    }
}
