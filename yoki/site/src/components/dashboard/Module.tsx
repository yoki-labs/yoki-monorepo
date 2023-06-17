import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LabsSwitch from "../LabsSwitch";
import React from "react";

export type Props = { name: string; icon: IconDefinition; description: string; activeClassName: string; isActive: boolean };

export default class Module extends React.Component<Props, { isActive: boolean }> {
    constructor(props: Props) {
        super(props);
        this.state = { isActive: props.isActive };
    }

    render() {
        const { name, description, icon, activeClassName } = this.props;
        const { isActive } = this.state;

        return (
            <div className={`grid grid-cols-4 w-96 h-48 rounded-xl overflow-hidden shadow-xl bg-spacedark-900`}>
                <aside className={`flex items-center col-span-1 transition-all ease-in duration-300 bg-gradient-to-br bg-spacedark-800 ${isActive ? activeClassName : ""}`}>
                    <div className="flex grow flex-col items-center items-center">
                        <FontAwesomeIcon className={`margin-auto w-9 h-9 text-white`} icon={icon} />
                    </div>
                </aside>
                <article className="px-6 py-3 col-span-3">
                    <div className="flex gap-4">
                        <h2 className="text-spacelight-950 text-xl font-bold card-title">{name}</h2>
                        {/* <input type="checkbox" className="toggle justify-end" /> */}
                        <LabsSwitch className="toggle justify-end" defaultChecked={this.props.isActive} onChange={(_, isActive) => this.setState({ isActive })} />
                    </div>
                    <p className="text-spacelight-700">{description}</p>
                </article>
            </div>
        );
    }
}
