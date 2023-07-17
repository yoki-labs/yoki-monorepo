import React from "react";
import { DashboardPageProps } from "./page";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

export default class LogsPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}