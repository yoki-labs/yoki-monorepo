import { AspectRatio, AspectRatioProps } from "@mui/joy";

const gradients = [
    "red",
    "orange",
    "green",
    "teal",
    "cyan",
    "blue",
    "violet",
    "purple",
    "pink",
];

export default function FakeImage({ number, ...props }: AspectRatioProps & { number: number; }) {
    const colour1 = gradients[number];
    const colour2 = gradients[(number + 1) % 9];

    return (
        <AspectRatio slotProps={{ content: { className: `bg-gradient-to-br from-${colour1}-500 to-${colour2}-400 from-0% via-50% to-100% w-full` } }} {...props}>

        </AspectRatio>
    );
}