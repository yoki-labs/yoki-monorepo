import Link from "next/link"
import { useRouter } from "next/router";

export const NavLink = ({ to, children, className, activeClass }: { to: string; children: any, className: string, end?: boolean, activeClass?: string }) => {
    const router = useRouter();
    if (router.pathname === to) className += activeClass ?? "!text-indigo-500";

    return <Link href={to} className={className}>{children}</Link>
}