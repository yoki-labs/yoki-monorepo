import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GuildedServer } from "../../lib/@types/guilded/Server";

export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
    return (
        <div className="drawer drawer-mobile">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col m-12">
                <div>{props.children}</div>
                <label htmlFor="my-drawer-2" className="btn bg-custom-guilded drawer-button lg:hidden">
                    Open drawer
                </label>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                <ul className="menu p-4 w-72 bg-gray-900 text-base-content flex flex-col">
                    <select className="select select-warning select-lg w-full max-w-xs">
                        <option disabled selected>
                            Pick a server
                        </option>

                        {props.servers.map((server) => (
                            <option>{server.name.length > 17 ? `${server.name.slice(0, 17)}...` : server.name}</option>
                        ))}
                    </select>

                    <div className="my-16 mx-4">
                        <div className="flex flex-row">
                            <FontAwesomeIcon icon={faCog} className="text-3xl" />
                            <p className="text-xl">Main Settings</p>
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    );
}
