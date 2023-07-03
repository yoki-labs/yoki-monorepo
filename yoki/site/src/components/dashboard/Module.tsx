import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LabsSwitch from "../LabsSwitch";
import React from "react";
import { AspectRatio, Card, CardContent, CardOverflow, Typography } from "@mui/joy";

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
            <Card orientation="horizontal" variant="plain">
                <CardOverflow>
                    <AspectRatio ratio="0.5" sx={{ width: 80 }}>
                        <aside className={`flex items-center col-span-1 transition-all ease-in duration-300 bg-gradient-to-br bg-spacedark-800 ${isActive ? activeClassName : ""}`}>
                            <div className="flex grow flex-col items-center items-center">
                                <FontAwesomeIcon className={`margin-auto w-9 h-9 text-white`} icon={icon} />
                            </div>
                        </aside>
                    </AspectRatio>
                </CardOverflow>
                <CardContent>
                    <div className="flex gap-4">
                        <Typography fontWeight="md" level="body1">
                            {name}
                        </Typography>
                        <LabsSwitch className="toggle justify-end" defaultChecked={this.props.isActive} onChange={({ target }) => this.setState({ isActive: target.checked })} />
                    </div>
                    <Typography level="body2">{description}</Typography>
                </CardContent>
            </Card>
        );
    }
}
