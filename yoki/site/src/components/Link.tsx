import NextLink from "next/link";
import { Link as JoyLink, LinkProps } from "@mui/joy";

type Props = {
    href: string;
};

export default function Link({ href, ...props }: Props & LinkProps) {
    return (
        <NextLink href={href}>
            <JoyLink component="span" {...props} />
        </NextLink>
    )
}