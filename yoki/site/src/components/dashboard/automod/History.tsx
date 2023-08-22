import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, ButtonGroup, CircularProgress, Input, Stack, Table } from "@mui/joy";
import React from "react";

import { DashboardPageProps } from "../pages";
import HistoryCase from "./HistoryCase";
import { SanitizedAction } from "../../../lib/@types/db";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

type State = {
    isLoaded: boolean;
    page: number;
    cases: SanitizedAction[];
    totalCases: number;
    search?: string;
};

export default class HistoryPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, cases: [], totalCases: 0, page: 0 };
    }

    fetchCases(search?: string) {
        const { serverConfig: { serverId } } = this.props;
        const { page } = this.state;

        return fetch(`/api/servers/${serverId}/cases?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ cases, count }) => this.setState({ isLoaded: true, cases, totalCases: count, search }))
            .catch((errorResponse) => console.error("Error while fetching data:", errorResponse));
    }


    async deleteCase(action: SanitizedAction) {
        const { serverId, id } = action;
        const { cases, totalCases } = this.state;

        // To not make it stay at all
        this.setState({
            cases: cases.filter((x) => x.id !== id),
            totalCases: totalCases - 1,
        });

        return fetch(`/api/servers/${serverId}/cases/${id}`, {
            method: "DELETE",
            headers: { "content-type": "application/json" },
        });
    }

    componentDidUpdate(_prevProps: DashboardPageProps, prevState: State): Promise<unknown> | void {
        const { page } = this.state;

        // If page changed, fetch it again
        if (prevState.page !== page)
            return this.fetchCases();
    }

    componentDidMount(): Promise<unknown> {
        return this.fetchCases();
    }

    setPage(page: number) {
        this.setState({ page });
    }

    render() {
        const { isLoaded, cases, totalCases, page, search } = this.state;
        const { serverConfig } = this.props;

        // Still loading the history
        if (!isLoaded)
            return <CircularProgress />;

        // No cases to display
        if (!(totalCases || search))
            return <PagePlaceholder icon={PagePlaceholderIcon.NotFound} title="Squeaky clean history!" description="There are no moderation cases." />

        const maxPages = Math.ceil(totalCases / 50);
        console.log("Rendering with search", { search, totalCases, cases });

        return (
            <Stack direction="column" gap={3}>
                <Box>
                    <Input onChange={({ target }) => (console.log("Searching", [target.value]), this.fetchCases(target.value))} variant="outlined" placeholder="Search cases" startDecorator={<FontAwesomeIcon icon={faMagnifyingGlass} />} />
                </Box>

                <Table size="lg" variant="plain" sx={{ borderRadius: 8, overflow: "hidden", "--Table-headerUnderlineThickness": 0 }}>
                    <thead>
                        <tr>
                            <th style={{ width: 60 }}></th>
                            <th>Action</th>
                            <th>Reason</th>
                            <th>User</th>
                            <th>Moderator</th>
                            <th>CreatedAt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.map((action) => <HistoryCase onDelete={this.deleteCase.bind(this, action)} timezone={serverConfig.timezone} action={action} />)}
                    </tbody>
                </Table>

                { maxPages > 1 && <ButtonGroup>
                    {[...(pagesToArray(maxPages) as unknown as number[])].map((buttonPage) =>
                        <Button disabled={page === buttonPage} onClick={this.setPage.bind(this, buttonPage)}>{buttonPage + 1}</Button>
                    )}
                </ButtonGroup> }
            </Stack>
        );
    }
}

function* pagesToArray(maxPages: number) {
    for (let i = 0; i < maxPages; i++)
        yield i;
}
