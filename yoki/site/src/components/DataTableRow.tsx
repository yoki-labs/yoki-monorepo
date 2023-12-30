import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox, IconButton, Sheet } from "@mui/joy";
import React, { ReactNode } from "react";
import { CSSProperties } from "styled-components";

type Props = {
    id: string;
    children?: ReactNode | ReactNode[];
    columnCount: number;
    ExpandedInfoRenderer?: () => ReactNode | ReactNode[];
    disableSelection?: boolean;
    isSelected: boolean;
    onSelected: (state: boolean) => unknown;
};

type State = {
    isExpanded: boolean;
};

export default class DataTableRow extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { isExpanded: false };
    }

    toggleExpanded() {
        const { isExpanded } = this.state;

        this.setState({ isExpanded: !isExpanded });
    }

    renderInfoRow() {
        const { id, ExpandedInfoRenderer: expandedInfo, disableSelection, isSelected, columnCount } = this.props;

        if (!expandedInfo) return <></>;

        return (
            <tr style={{ "--TableCell-dataBackground": isSelected ? "var(--labs-palette-primary-950)" : "transparent" } as unknown as CSSProperties} data-id={`${id}:expansion`}>
                <td style={{ height: 0, padding: 0 }} colSpan={columnCount - Number(disableSelection) + 2}>
                    <Sheet color="neutral" sx={{ m: 1, borderRadius: 8, p: 2, pl: 4, pr: 4 }}>
                        {expandedInfo()}
                    </Sheet>
                </td>
            </tr>
        );
    }

    render() {
        const { id, children, disableSelection, onSelected, isSelected, ExpandedInfoRenderer: expandedInfo } = this.props;
        const { isExpanded } = this.state;

        return (
            <>
                <tr
                    data-id={id}
                    style={
                        {
                            "--TableCell-dataBackground": isSelected ? "var(--labs-palette-primary-950)" : "transparent",
                            "--TableCell-borderColor": isExpanded ? "transparent" : undefined,
                        } as unknown as CSSProperties
                    }
                >
                    {!disableSelection && <td>
                        <Checkbox checked={isSelected} onChange={({ target }) => onSelected(target.checked)} variant="soft" size="lg" />
                    </td>}
                    {Boolean(children) && children}
                    <td>
                        {expandedInfo && (
                            <IconButton onClick={this.toggleExpanded.bind(this)} color="neutral" variant="soft" aria-label="More button">
                                <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                            </IconButton>
                        )}
                    </td>
                </tr>
                {/* isExpanded is modified by arrow button. This is for showing IDs and whatnot */}
                {isExpanded && this.renderInfoRow()}
            </>
        );
    }
}
