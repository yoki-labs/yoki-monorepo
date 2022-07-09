export default function RolePreview(props: { roles: { color?: "guilded"; border?: "dashed"; name: string }[] }) {
    return (
        <div>
            <div className="flex pt-2 space-x-2">
                {props.roles.map((role) => {
                    const borderColor = role.color === "guilded" ? "border-custom-guilded" : "";
                    const color = role.color === "guilded" ? "bg-custom-guilded" : "bg-gray-400";
                    return (
                        <div key={role.name} className={`border-[.5px] rounded-full ${role.border === "dashed" ? "border-dashed" : "border"} ${borderColor} px-2 py-1 flex`}>
                            <div className={`my-auto w-5 h-5 ${color} rounded-full`}></div>
                            <p className="pl-2">{role.name}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
