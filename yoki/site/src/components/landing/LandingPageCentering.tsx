import { ReactNode } from "react";
import LandingPage from "./LandingPage";
import { Stack } from "@mui/joy";

export default function LandingPageCentered({ children }: { children: ReactNode | ReactNode[]; }) {
    return (
        <LandingPage>
            <Stack direction="row" alignItems="center" sx={{ flex: "1" }}>
                <Stack direction="column" alignItems="center" sx={{ flex: "1", mb: 40 }}>
                    {children}
                </Stack>
            </Stack>
        </LandingPage>
    );
}