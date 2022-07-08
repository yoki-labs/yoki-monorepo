export default function NavbarItem(props: { text: string; dest: string }) {
    return (
        <li className="text-white transition ease-in-out duration-150 border-b-2 border-transparent hover:border-gray-500 hover:scale-110">
            <a className="text-lg" href={props.dest}>
                {props.text}
            </a>
        </li>
    );
}
