import { IconDefinition, faBan, faClipboardUser, faCog, faEnvelope, faHashtag, faLayerGroup, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import OverviewPage from "./pages/Overview";
import ConfigPage from "./pages/Config";
import AutomodPage from "./pages/Automod";
import HistoryPage from "./pages/History";
import ModmailPage from "./pages/Modmail";
import React from "react";
import AntiraidPage from "./pages/Antiraid";
import AppealsPage from "./pages/Appeals";
import LogsPage from "./pages/Logs";

export interface DashboardPageItem {
    id: string;
    name: string;
    icon: IconDefinition;
    component: (typeof React.Component) | ((props: any) => React.ReactElement);
}

export const dashboardPageList: DashboardPageItem[] = [
    { id: "overview", name: "Overview", icon: faLayerGroup, component: OverviewPage },
    { id: "main", name: "Config", icon: faCog, component: ConfigPage },
    { id: "automod", name: "Automod", icon: faBan, component: AutomodPage },
    { id: "history", name: "Cases", icon: faClipboardUser, component: HistoryPage },
    { id: "logs", name: "Logging", icon: faHashtag, component: LogsPage },
    { id: "modmail", name: "Modmail", icon: faEnvelope, component: ModmailPage },
    { id: "antiraid", name: "Antiraid", icon: faShieldHalved, component: AntiraidPage },
    { id: "appeals", name: "Appeals", icon: faPrayingHands, component: AppealsPage },
];