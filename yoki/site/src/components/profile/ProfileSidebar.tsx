import ProfileSidebarTab from "./ProfileSidebarTab";
import { Box, List } from "@mui/joy";
import { profilePageList } from "./pages";

type Props = {
    menuToggled: boolean;
    page: string;
};

export function ProfileSidebar({ page, menuToggled }: Props) {
    // const [currentPage, setModule] = useAtom(navbarAtom);
    const showStateClass = menuToggled ? "" : " md:block hidden";

    return (
        <Box
            sx={{ fontSize: 14, pb: 5, userSelect: "none" }}
            className={`px-5 w-full pt-4 md:pt-0 md:px-7 md:max-w-80 md:w-80 h-full overflow-y-auto overflow-x-hidden ${showStateClass}`}
        >
            <List variant="plain">
                {profilePageList.map((item) => (
                    <ProfileSidebarTab key={item.id} item={item} isActive={page === item.id} />
                ))}
            </List>
        </Box>
    );
}
