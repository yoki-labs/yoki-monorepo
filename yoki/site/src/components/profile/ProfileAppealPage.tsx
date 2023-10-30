import { Stack, Typography } from "@mui/joy";
import { ProfilePageProps } from "./pages";
import DataTable from "../DataTable";
import { SanitizedAppeal } from "../../lib/@types/db";
import React from "react";
import { ProfileAppealCard, ProfileAppealRow } from "./ProfileAppealItem";

export default class ProfileAppealPage extends React.Component<ProfilePageProps> {
    constructor(props: ProfilePageProps) {
        super(props);
    }

    getAppealsRoute(page: number, search?: string) {
        return `/api/user/appeals?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchAppeals(page: number, search?: string) {
        return fetch(this.getAppealsRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ appeals, count }) => ({ items: appeals, maxPages: Math.ceil(count / 50) }));
    }

    async deleteAppeals(appealIds: number[], page: number, search?: string) {
        return fetch(this.getAppealsRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ appealIds }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ appeals, count }) => ({ items: appeals, maxPages: Math.ceil(count / 50) }));
    }

    render() {
        return (
            <Stack direction="column" gap={2}>
                <Typography level="h2">Your server ban appeals</Typography>
                <DataTable<SanitizedAppeal, number>
                    itemType="ban appeals"
                    timezone="America/New_York"
                    columns={["Server", "Content", "Status", "When"]}
                    getItems={this.fetchAppeals.bind(this)}
                    deleteItems={this.deleteAppeals.bind(this)}
                    ItemRenderer={ProfileAppealRow}
                    ItemMobileRenderer={ProfileAppealCard}
                />
            </Stack>
        );
    }
}