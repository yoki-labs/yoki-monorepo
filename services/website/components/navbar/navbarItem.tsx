export default function NavbarItem(props: { text: string; dest: string }) {
    return (
        <li>
            <a href={props.dest}>{props.text}</a>
        </li>
    );
}
