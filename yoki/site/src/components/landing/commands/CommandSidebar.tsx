import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, List, ListItemButton, ListItemDecorator } from "@mui/joy";
import { useRouter } from "next/router";

type Props = {
    // ID to Display name
    categories: Record<string, { icon: IconDefinition; name: string; url: string }>;
    activeCategory: string;
};

export default function CommandSidebar({ categories, activeCategory }: Props) {
    const router = useRouter();

    return (
        <Box sx={{ fontSize: 14, pt: 0, pb: 5 }} className={`h-full overflow-y-auto overflow-x-hidden`}>
            <List variant="plain">
                {Object.values(categories).map((category) => (
                    <ListItemButton onClick={() => router.push(`/commands/${category.url}`)} key={`command-category.${category.url}`} selected={category.url === activeCategory}>
                        <ListItemDecorator>
                            <FontAwesomeIcon icon={category.icon} />
                        </ListItemDecorator>
                        {category.name}
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}
