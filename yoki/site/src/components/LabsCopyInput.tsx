import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chip, IconButton, Input, Stack, Typography } from "@mui/joy";
import React from "react";

type Props = {
    text: string;
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
        navigator.clipboard.writeText(text);

        // Feedback; let user know they copied the text
        this.setState({ copied: true });
    }

    render() {
        const { text } = this.props;
        const { copied } = this.state;

        return (
            <Input
                slots={{
                    input: Stack,
                }}
                slotProps={{
                    input: {
                        children: [
                            <Typography>
                                {text}
                            </Typography>,
                            copied && <Chip variant="outlined" color="success">
                                Copied!
                            </Chip>
                        ],
                        direction: "row",
                        alignItems: "center",
                        gap: 2,
                    },
                }}
                sx={{ width: "min-content" }}
                endDecorator={
                    <IconButton
                        variant="plain"
                        color="neutral"
                        sx={(theme) => ({
                            backgroundColor: `${theme.vars.palette.neutral[600]} !important`,
                            ":hover": {
                                backgroundColor: `${theme.vars.palette.neutral[500]} !important`,
                            }
                        })}
                        onClick={this.copyText.bind(this)}>
                        <FontAwesomeIcon icon={faClipboard} />
                    </IconButton>
                }
            />
        );
    }
}