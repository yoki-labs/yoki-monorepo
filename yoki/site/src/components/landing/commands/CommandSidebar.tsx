import { Box, List, ListItemButton } from "@mui/joy";
import Link from "next/link";

type Props = {
    // ID to Display name
    categories: Record<string, string>;
    activeCategory: string;
};

export default function CommandSidebar({ categories, activeCategory }: Props) {
    return (
        <Box sx={{ width: 300, maxWidth: 300, fontSize: 14, pt: 0, pb: 5 }} className={`h-full overflow-y-auto overflow-x-hidden`}>
            <List variant="plain">
                { Object.keys(categories).map((category) =>
                    <Link href={`/commands/${category}`} style={{ textDecoration: "none" }}>
                        <ListItemButton key={`command-category-${category}`} selected={category === activeCategory}>
                            { categories[category] }
                        </ListItemButton>
                    </Link>
                )}
            </List>
        </Box>
    );
}