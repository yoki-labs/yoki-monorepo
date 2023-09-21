import { faMagnifyingGlass, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, Checkbox, CircularProgress, Grid, Input, ListItemDecorator, MenuItem, Modal, Stack, Table } from "@mui/joy";
import React, { ReactNode } from "react";

import PagePlaceholder, { PagePlaceholderIcon } from "./PagePlaceholder";
import LabsOverflowButton from "./LabsOverflowButton";
import { DeletionConfirmationModal } from "./DeletionConfirmationModal";
import { toast } from "react-hot-toast";
import { notifyFetchError } from "../utils/errorUtil";

// type State = {
//     isLoaded: boolean;
//     page: number;
//     cases: SanitizedAction[];
//     totalCases: number;
//     search?: string;
//     selectedIds: string[];
// };

type FetchedItems<T> = {
    items: T[];
    maxPages: number;
};

export type ItemProps<TItem> = {
    item: TItem;
    columnCount: number;
    timezone: string | null;
    isSelected: boolean;
    onSelected: (checked: boolean) => void;
};

type State<TItem extends { id: TItemId }, TItemId> = {
    isLoaded: boolean;
    isMounted: boolean;
    items: TItem[];
    page: number;
    search?: string;
    selectedItems: TItemId[];
    maxPages: number;
    error?: { code: string; message: string };
};

type Props<TItem extends { id: TItemId }, TItemId> = {
    itemType: string;
    timezone: string | null;
    columns: string[];
    getItems: (page: number, search?: string) => Promise<FetchedItems<TItem>>;
    deleteItems: (items: TItemId[], page: number, search?: string) => Promise<FetchedItems<TItem>>;
    ItemRenderer: (props: ItemProps<TItem>) => JSX.Element;
};

export default class DataTable<TItem extends { id: TItemId }, TItemId> extends React.Component<Props<TItem, TItemId>, State<TItem, TItemId>> {
    constructor(props: Props<TItem, TItemId>) {
        super(props);

        this.state = { isLoaded: false, isMounted: false, items: [], maxPages: 0, selectedItems: [], page: 0 };
    }

    componentDidMount(): unknown {
        // To not re-mount
        if (this.state.isMounted) return;

        this.setState({ isMounted: true });
        return this.fetchItems(0);
    }

    set allSelected(checked: boolean) {
        const { items } = this.state;

        this.setState({ selectedItems: checked ? items.map((x) => x.id) : [] });
    }

    get allSelected(): boolean {
        const { items, selectedItems } = this.state;

        return !items.some((item) => !selectedItems.includes(item.id));
    }

    async fetchItems(page: number, search?: string) {
        return this.props
            .getItems(page, search)
            .then(({ items, maxPages }) => this.setState({ isLoaded: true, items, maxPages, page, search }))
            .catch(async (errorResponse) => this.onFetchError(errorResponse));
    }

    async deleteSelectedItems() {
        const { selectedItems, page, search } = this.state;

        return this.props
            .deleteItems(selectedItems, page, search)
            .then(({ items, maxPages }) => this.setState({ items, maxPages, page, search }))
            .catch(notifyFetchError.bind(null, `Error while deleting data table item`));
    }

    async onFetchError(errorResponse: Response) {
        const error = await errorResponse.json();

        console.log(`Error while fetching ${this.props.itemType} in data table:`, error);

        this.setState({ error });
    }

    toggleSelection(item: TItem, isChecked: boolean) {
        const { selectedItems } = this.state;

        this.setState({
            selectedItems: isChecked ? selectedItems.concat(item.id) : selectedItems.filter((x) => x !== item.id),
        });
    }

    render() {
        // Still loading the items
        if (this.state.error)
            return (
                <PagePlaceholder
                    icon={PagePlaceholderIcon.Unexpected}
                    title={`Error while fetching ${this.props.itemType} (${this.state.error.code})`}
                    description={this.state.error.message}
                />
            );
        else if (!this.state.isLoaded)
            return (
                <Stack direction="column" alignItems="center">
                    <CircularProgress />
                </Stack>
            );

        const { items, page, search, maxPages, selectedItems } = this.state;
        const { columns, itemType, timezone, ItemRenderer } = this.props;

        return (
            <Stack direction="column" gap={3}>
                <Grid container spacing={5}>
                    <Grid xs={4}>
                        <Input
                            onChange={({ target }) => this.fetchItems(page, target.value)}
                            variant="outlined"
                            placeholder={`Search ${itemType}`}
                            startDecorator={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                        />
                    </Grid>
                </Grid>

                {items.length ? (
                    <>
                        <Table size="lg" variant="plain" sx={{ borderRadius: 8, overflow: "hidden" }}>
                            <thead>
                                <tr>
                                    {/* Select corner */}
                                    <th style={{ width: 30 }}>
                                        <Checkbox checked={this.allSelected} variant="soft" size="lg" onChange={({ target }) => (this.allSelected = target.checked)} />
                                    </th>
                                    {columns.map((column) => (
                                        <th>{column}</th>
                                    ))}
                                    {/* Expand corner */}
                                    <th style={{ width: 60 }}>
                                        <HistoryOverflow itemType={itemType} selectedItems={this.state.selectedItems} onCaseDeletion={this.deleteSelectedItems.bind(this)} />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <ItemRenderer
                                        item={item}
                                        timezone={timezone}
                                        columnCount={columns.length}
                                        isSelected={selectedItems.includes(item.id)}
                                        onSelected={this.toggleSelection.bind(this, item)}
                                    />
                                ))}
                            </tbody>
                        </Table>

                        {maxPages > 1 && (
                            <ButtonGroup>
                                {[...(pagesToArray(maxPages) as unknown as number[])].map((buttonPage) => (
                                    <Button disabled={page === buttonPage} onClick={this.fetchItems.bind(this, buttonPage, search)}>
                                        {buttonPage + 1}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        )}
                    </>
                ) : (
                    <PagePlaceholder icon={PagePlaceholderIcon.NotFound} title={`No ${itemType}`} description={`There are no ${itemType} to be found.`} />
                )}
            </Stack>
        );
    }
}

function HistoryOverflow<TItem>({ itemType, selectedItems, onCaseDeletion }: { itemType: string; selectedItems: TItem[]; onCaseDeletion: () => Promise<unknown> }) {
    const [openDeletePrompt, setOpenDeletePrompt] = React.useState(false);

    return (
        <>
            <LabsOverflowButton id={`history-overflow`} disabled={!selectedItems.length} variant="soft">
                <MenuItem color="danger" onClick={() => setOpenDeletePrompt(true)}>
                    <ListItemDecorator>
                        <FontAwesomeIcon icon={faTrash} />
                    </ListItemDecorator>
                    Delete {selectedItems.length} {itemType}
                </MenuItem>
            </LabsOverflowButton>
            <Modal open={openDeletePrompt} onClose={() => setOpenDeletePrompt(false)}>
                <DeletionConfirmationModal
                    itemType={`${selectedItems.length} ${itemType}`}
                    onClose={() => setOpenDeletePrompt(false)}
                    onConfirm={() => (setOpenDeletePrompt(false), onCaseDeletion())}
                />
            </Modal>
        </>
    );
}

function* pagesToArray(maxPages: number) {
    for (let i = 0; i < maxPages; i++) yield i;
}
