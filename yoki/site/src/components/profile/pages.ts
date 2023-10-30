import {
    faPrayingHands,
    faUser,
    faUserCircle,
    IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { ColorPaletteProp } from "@mui/joy";

import React from "react";
import { LabsSessionUser } from "../../utils/pageUtil";
import ProfileOverviewPage from "./ProfileOverviewPage";
import ProfileAppealPage from "./ProfileAppealPage";

export interface ProfilePageItem {
    id: string;
    name: string;
    icon: IconDefinition;
    component: typeof React.Component | ((props: ProfilePageProps) => React.ReactElement);
    color?: ColorPaletteProp;
}

export interface ProfilePageProps {
    user: LabsSessionUser;
    appealCount: number;
}

export const profilePageList: ProfilePageItem[] = [
    { id: "overview", name: "Overview", icon: faUserCircle, component: ProfileOverviewPage },
    { id: "appeals", name: "Appeals", icon: faPrayingHands, component: ProfileAppealPage },
];

