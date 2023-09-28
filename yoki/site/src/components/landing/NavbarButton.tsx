import { IconDefinition, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mui/joy";
import Link from "next/link";
import { useRouter } from "next/router";

export default function NavbarButton({ text, icon, onClick, color }: { text: string; icon?: IconDefinition; onClick: () => unknown; color: "primary" | "neutral" | "warning" }) {
    return (
        <Button size="lg" startDecorator={icon && <FontAwesomeIcon icon={icon} />} variant="plain" color={color} onClick={onClick} sx={{ width: "100%" }}>
            {text}
        </Button>
    );
}

export function NavbarButtonList() {
    const router = useRouter();

    return (
        <>
            <NavbarButton text="Supercharge" onClick={router.push.bind(null, "/premium")} icon={faBolt} color="warning" />
            <NavbarButton text="Dashboard" onClick={router.push.bind(null, "/dashboard")} color="neutral" />
            <NavbarButton text="Commands" onClick={router.push.bind(null, "/commands/general")} color="neutral" />
            <NavbarButton text="Docs" onClick={router.push.bind(null, "/docs")} color="neutral" />
        </>
    );
}
