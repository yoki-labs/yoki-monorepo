import { faMagnifyingGlass, faSliders, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    CircularProgress,
    Dropdown,
    Input,
    ListItem,
    ListItemDecorator,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    Stack,
    Table,
    Typography,
} from "@mui/joy";
import React from "react";

import PagePlaceholder, { PagePlaceholderIcon } from "./PagePlaceholder";
import LabsOverflowButton from "./LabsOverflowButton";
import { DeletionConfirmationModal } from "./DeletionConfirmationModal";
import { notifyFetchError } from "../utils/errorUtil";
import { GuildedSanitizedUserDetail } from "../lib/@types/guilded";
import LabsForm, { LabsFormFieldValueMap } from "./form/LabsForm";
import { LabsFormField, LabsFormSectionOrder } from "./form/form";

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
    users?: Record<string, GuildedSanitizedUserDetail>;
};

export type ItemProps<TItem> = {
    item: TItem;
    columnCount: number;
    timezone: string | null;
    disableSelection?: boolean;
    isSelected: boolean;
    onSelected: (checked: boolean) => void;
    users?: Record<string, GuildedSanitizedUserDetail>;
};

export type OverflowProps<TItem> = {
    itemType: string;
    selectedItems: TItem[];
    onItemDeletion: () => unknown;
};

type State<TItem extends { id: TItemId }, TItemId> = {
    isLoaded: boolean;
    isMounted: boolean;

    items: TItem[];
    selectedItems: TItemId[];

    page: number;
    search?: string;
    filter?: LabsFormFieldValueMap;

    maxPages: number;
    users?: Record<string, GuildedSanitizedUserDetail>;
    error?: { code: string; message: string };
};

type Props<TItem extends { id: TItemId }, TItemId> = {
    itemType: string;

    timezone: string | null;
    columns: string[];

    filterFormFields?: LabsFormField[];
    getFilterFormFields?: (users?: Record<string, GuildedSanitizedUserDetail>) => LabsFormField[];

    disableOperations?: boolean;
    getItems: (page: number, search?: string, filter?: LabsFormFieldValueMap) => Promise<FetchedItems<TItem>>;
    deleteItems: (items: TItemId[], page: number, search?: string) => Promise<FetchedItems<TItem>>;

    ItemRenderer: (props: ItemProps<TItem>) => JSX.Element;
    ItemMobileRenderer: (props: ItemProps<TItem>) => JSX.Element;
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

    async fetchItems(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        return this.props
            .getItems(page, search, filter)
            .then(({ items, maxPages, users }) => this.setState({ isLoaded: true, items, maxPages, page, search, filter, users }))
            .catch(async (errorResponse) => this.onFetchError(errorResponse));
    }

    async deleteSelectedItems() {
        const { selectedItems, page, search } = this.state;

        return this.props
            .deleteItems(selectedItems, page, search)
            .then(({ items, maxPages, users }) => this.setState({ items, maxPages, page, search, selectedItems: [], users }))
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

    setFilter(filter: LabsFormFieldValueMap) {
        this.setState({
            filter,
        });
    }

    DataTableToggleCheckbox() {
        return <Checkbox checked={this.allSelected} variant="soft" size="lg" onChange={({ target }) => (this.allSelected = target.checked)} />;
    }

    DataTableOverflow() {
        return <DataTableOverflow<TItemId> itemType={this.props.itemType} selectedItems={this.state.selectedItems} onItemDeletion={this.deleteSelectedItems.bind(this)} />;
        // return <DataTableOverflow itemType={this.props.itemType} selectedItems={this.state.selectedItems} onCaseDeletion={this.deleteSelectedItems.bind(this)} />;
    }

    renderItems() {
        const { items, selectedItems, users } = this.state;
        const { timezone, columns, disableOperations, ItemRenderer, ItemMobileRenderer } = this.props;

        return items.map((item) => [
            <ItemRenderer
                item={item}
                users={users}
                timezone={timezone}
                columnCount={columns.length}
                isSelected={selectedItems.includes(item.id)}
                onSelected={this.toggleSelection.bind(this, item)}
                disableSelection={disableOperations}
            />,
            <ItemMobileRenderer
                item={item}
                users={users}
                timezone={timezone}
                columnCount={columns.length}
                isSelected={selectedItems.includes(item.id)}
                onSelected={this.toggleSelection.bind(this, item)}
                disableSelection={disableOperations}
            />,
        ]);
    }

    render() {
        // Still loading the items
        if (this.state.error)
            return (
                <PagePlaceholder icon={PagePlaceholderIcon.Unexpected} title={`Error while fetching ${this.props.itemType} (${this.state.error.code})`}>
                    {this.state.error.message}
                </PagePlaceholder>
            );
        else if (!this.state.isLoaded)
            return (
                <Stack direction="column" alignItems="center">
                    <CircularProgress />
                </Stack>
            );

        const { items, page, search, filter, maxPages } = this.state;
        const { columns, itemType, disableOperations, filterFormFields, getFilterFormFields } = this.props;
        const renderedItems = this.renderItems();

        return (
            <Stack direction="column" gap={3}>
                <Stack gap={2} className="flex-col md:flex-row">
                    <Input
                        className="flex-1"
                        onChange={({ target }) => this.fetchItems(page, target.value, filter)}
                        variant="plain"
                        placeholder={`Search ${itemType}`}
                        startDecorator={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                        sx={{ fontWeight: "bolder" }}
                    />
                    <ButtonGroup>
                        {(filterFormFields || getFilterFormFields) && (
                            <Dropdown variant="plain" startDecorator={<FontAwesomeIcon icon={faSliders} />}>
                                <MenuButton startDecorator={<FontAwesomeIcon icon={faSliders} />}>Filter</MenuButton>
                                <DataTableFilterMenu
                                    itemType={itemType}
                                    fields={filterFormFields}
                                    getFields={getFilterFormFields}
                                    users={this.state.users}
                                    onChange={(filter) => this.fetchItems(page, search, filter)}
                                />
                            </Dropdown>
                        )}
                    </ButtonGroup>
                </Stack>

                {items.length ? (
                    <>
                        <Box className="block md:hidden">
                            {!disableOperations && (
                                <Stack direction="row" gap={2}>
                                    {this.DataTableToggleCheckbox()}
                                    <Typography className="flex-1" level="title-md">
                                        Select all
                                    </Typography>
                                    {this.DataTableOverflow()}
                                </Stack>
                            )}
                            <Stack sx={{ mt: 3 }} direction="column" gap={2}>
                                {renderedItems.map(([, item]) => item)}
                            </Stack>
                        </Box>
                        <Table className="hidden md:table" size="lg" variant="plain" sx={{ borderRadius: 8, overflow: "hidden" }}>
                            <thead>
                                <tr>
                                    {/* Select corner */}
                                    {!disableOperations && <th style={{ width: 30 }}>{this.DataTableToggleCheckbox()}</th>}
                                    {columns.map((column) => (
                                        <th>{column}</th>
                                    ))}
                                    {/* Expand corner */}
                                    <th style={{ width: 60 }}>{!disableOperations && this.DataTableOverflow()}</th>
                                </tr>
                            </thead>
                            <tbody>{renderedItems.map(([item]) => item)}</tbody>
                        </Table>

                        {maxPages > 1 && (
                            <ButtonGroup>
                                {[...(pagesToArray(maxPages) as unknown as number[])].map((buttonPage) => (
                                    <Button disabled={page === buttonPage} onClick={this.fetchItems.bind(this, buttonPage, search, filter)}>
                                        {buttonPage + 1}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        )}
                    </>
                ) : (
                    <PagePlaceholder icon={PagePlaceholderIcon.NotFound} title={`No ${itemType}`}>
                        There are no {itemType} to be found.
                    </PagePlaceholder>
                )}
            </Stack>
        );
    }
}

export const querifyDataTableInfo = (search?: string, filter?: LabsFormFieldValueMap) =>
    `${search ? `&search=${encodeURIComponent(search)}` : ""}${
        filter
            ? Object.keys(filter)
                  .map((x) => (filter[x] !== null ? `&${x}=${filter[x]}` : ""))
                  .join("")
            : ""
    }`;

function DataTableOverflow<TItem>({ itemType, selectedItems, onItemDeletion }: OverflowProps<TItem>) {
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
                    onConfirm={() => (setOpenDeletePrompt(false), onItemDeletion())}
                />
            </Modal>
        </>
    );
}

type FilterMenuProps = {
    itemType: string;
    users?: Record<string, GuildedSanitizedUserDetail>;
    fields?: LabsFormField[];
    getFields?: (users?: Record<string, GuildedSanitizedUserDetail>) => LabsFormField[];
    onChange: (values: LabsFormFieldValueMap) => unknown;
};

function DataTableFilterMenu({ itemType, users, fields, getFields, onChange }: FilterMenuProps) {
    return (
        <Menu placement="bottom-start" sx={{ "--ListItem-paddingY": 0 }}>
            <ListItem>
                <LabsForm
                    sections={[
                        {
                            order: LabsFormSectionOrder.GridSm,
                            fields: fields ?? getFields!(users),
                        },
                    ]}
                    submitText={`Filter ${itemType}`}
                    onSubmit={onChange}
                    alwaysDisplayActions
                />
            </ListItem>
        </Menu>
    );
}

function* pagesToArray(maxPages: number) {
    for (let i = 0; i < maxPages; i++) yield i;
}
