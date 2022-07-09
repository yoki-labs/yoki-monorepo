import Image from "next/image";

export default function ProfilePreview(props: { avatarURL: string; avatarSize: string; username: string; description: string }) {
    return (
        <div className="flex">
            <Image className="rounded-full" src={props.avatarURL} width={props.avatarSize} height={props.avatarSize} alt="Profile Picture" />
            <div className="pl-4 text-white">
                <p className="text-xl font-semibold text-custom-guilded">{props.username}</p>
                <p className="text-sm">{props.description}</p>
            </div>
        </div>
    );
}
