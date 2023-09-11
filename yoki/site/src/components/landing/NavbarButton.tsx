import { IconDefinition, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mui/joy";
import Link from "next/link";

export default function NavbarButton({ text, icon, href, color }: { text: string; icon?: IconDefinition; href: string; color: "primary" | "neutral" | "warning"; }) {
    return (
        <Link href={href}>
            <Button size="lg" startDecorator={icon && <FontAwesomeIcon icon={icon} />} variant="plain" color={color} sx={{ width: "100%" }}>
                { text }
            </Button>
        </Link>
    )
}

export function NavbarButtonList() {
    return (
        <>
            <NavbarButton
                text="Supercharge"
                icon={faBolt}
                href="/premium"
                color="warning"
                />
            <NavbarButton
                text="Dashboard"
                href="/dashboard"
                color="neutral"
                />
            <NavbarButton
                text="Commands"
                href="/commands/general"
                color="neutral"
                />
            <NavbarButton
                text="Docs"
                href="/docs"
                color="neutral"
                />
        </>
    );
}