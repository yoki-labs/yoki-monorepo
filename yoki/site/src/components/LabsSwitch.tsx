import { Switch, SwitchProps } from "@mui/joy";
//import { Switch, SwitchProps } from "@mui/base";
import React from "react";

const LabsSwitch = React.forwardRef((props: SwitchProps, ref: React.ForwardedRef<HTMLButtonElement>) => (
    <Switch
        {...props}
        // ref={ref}
        // classes={{
        //     thumb: "bg-spacedark-950",
        //     track: "bg-spacedark-500 opacity-100",
        // }}
    />
));

export default LabsSwitch;
