import React from "react";
import { DashboardPageProps } from "./page";
import { SanitizedLogChannel } from "../../../lib/@types/db";
import { CircularProgress } from "@mui/joy";
import DashboardLogChannel from "../DashboardLog";

type State = {
    isLoaded: boolean;
    logs: SanitizedLogChannel[];
};

export default class LogsPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, logs: [] };
    }

    async componentDidMount(): Promise<void> {
        const { serverConfig: { serverId } } = this.props;
        await fetch(`/api/servers/${serverId}/logchannels`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ logs }) => this.setState({ isLoaded: true, logs }))
            .catch((errorResponse) => console.error("Error while fetching data:", errorResponse));
    }

    render() {
        const { serverConfig } = this.props;
        const { isLoaded, logs } = this.state;

        // Still fetching data
        if (!isLoaded)
            return <CircularProgress />;

        return (
            <>
                {logs.map((log) => (
                    <DashboardLogChannel {...log} types={[log.type]} timezone={serverConfig.timezone} />
                ))}
            </>
        );
    }
}