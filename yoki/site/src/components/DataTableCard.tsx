import { Box, Checkbox, Divider, Link, Sheet, Stack } from "@mui/joy";
import React, { ReactNode } from "react";

type Props = {
    id: string;
    children?: ReactNode | ReactNode[];
    ExpandedInfoRenderer: () => ReactNode | ReactNode[];
    TitleRenderer: () => JSX.Element;
    disableSelection?: boolean;
    isSelected: boolean;
    onSelected: (state: boolean) => unknown;
};

type State = {
    isExpanded: boolean;
};

export default class DataTableCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { isExpanded: false };
    }

    toggleExpanded() {
        const { isExpanded } = this.state;

        this.setState({ isExpanded: !isExpanded });
    }

    renderInfoRow() {
        const { ExpandedInfoRenderer: expandedInfo } = this.props;

        return (
            <Box>
                <Sheet color="neutral" sx={{ borderRadius: 8, p: 2 }}>
                    {expandedInfo()}
                </Sheet>
            </Box>
        );
    }

    render() {
        const { id, children, onSelected, disableSelection, isSelected, TitleRenderer } = this.props;
        const { isExpanded } = this.state;

        return (
            <Stack gap={1}>
                <Box data-id={id}>
                    <Stack gap={2} direction="row" alignItems="center">
                        <Stack sx={{ flex: "1" }} direction="row" gap={2} alignItems="center">
                            <TitleRenderer />
                        </Stack>
                        {!disableSelection && <Checkbox checked={isSelected} onChange={({ target }) => onSelected(target.checked)} variant="soft" size="lg" />}
                    </Stack>
                    {Boolean(children) && children}
                    <Box mt={2} mb={1}>
                        <Link onClick={this.toggleExpanded.bind(this)} sx={{ userSelect: "none" }}>
                            {isExpanded ? "See less" : "See more"}
                        </Link>
                    </Box>
                </Box>
                {/* isExpanded is modified by arrow button. This is for showing IDs and whatnot */}
                {isExpanded && this.renderInfoRow()}
                <Divider />
            </Stack>
        );
    }
}
