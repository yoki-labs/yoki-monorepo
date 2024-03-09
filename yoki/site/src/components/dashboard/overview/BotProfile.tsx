import React from "react";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

type State = {
};

export default class BotProfilePage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { };
    }

    render() {
        return (
            <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress!">
                This page has not been done yet. Come back later!
            </PagePlaceholder>
        );
    }
}
