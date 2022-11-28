import Activity from "../icons/Activity";
import Users from "../icons/Users";
import Label from "../text/Label";
import ProfilePreview from "./ProfilePreview";
import RolePreview from "./RolePreview";
import StatisticPreview from "./StatisticPreview";
import StatusPreview from "./StatusPreview";

export default function YokiPreview() {
    return (
        <div className="max-w-[450px] bg-[#15171d] px-8 pt-8 pb-4 text-white text-opacity-70 divide-y divide-gray-400/50 rounded-lg">
            <div className="pb-4">
                <ProfilePreview avatarURL="/face.png" avatarSize="60" username="Yoki" description="Server Protector 4000" />
                <p className="pt-4">A mod bot with a powerful set of tools to make your communities safer!</p>
                <div className="flex space-x-4 pt-4">
                    <StatisticPreview Icon={Activity} text="800+ Servers" />
                    <StatisticPreview Icon={Users} text="10,000+ Members" />
                </div>
            </div>
            <div className="py-4">
                <div className="pb-2">
                    <Label text="Status" />
                </div>
                <StatusPreview statusTitle="Keeping your communities safe" statusDescription="for always and forever" />
            </div>
            <div className="py-4">
                <Label text="Roles" />
                <RolePreview
                    roles={[
                        {
                            name: "Mod",
                            border: "dashed",
                        },
                        {
                            name: "Server Protector 4000",
                            color: "guilded",
                        },
                    ]}
                />
            </div>
        </div>
    );
}
