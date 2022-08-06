import styled from "styled-components";

export const NavbarWrapper = styled.div`
    z-index: 10;
    margin: 0 auto;
    width: clamp(350px, 95vw, 900px);
    height: 100%;

    top: 1rem;
    position: sticky;

    transition: 0.2s ease;

    a {
        color: white;
        font-size: clamp(18px, 2vw, 22px);
    }

    .wrapper {
        display: flex;
        padding: 20px 35px;
        justify-content: space-between;
        align-items: center;
        transition: 0.2s ease;

        &.scrolled {
            background-color: var(--grey);
            border-radius: 10px;
            transition: 0.4s all;
            margin: 15px;
            box-shadow: 4px 4px 4px 4px rgba(0, 0, 0, 0.2);
        }
    }
`;

export const NavbarItemList = styled.div`
    margin-left: auto;
    display: flex;

    transition: 0.3s ease;

    .link {
        padding: 5px 10px;
        margin: 0 5px;
        border-radius: 5px;
        transition: 0.3s ease;

        &:hover {
            background-color: var(--grey-fade);
        }

        &.premium {
            color: var(--guilded-yellow);
        }

        &.invite {
            color: black;
            background-color: var(--guilded-yellow);
            &:hover {
                color: var(--guilded-yellow);
                background-color: var(--grey);
            }
        }
    }
`;

export const Hamburger = styled.div``;

export const SideNavbar = styled.div`
    position: fixed;
    right: 0;
    top: 0;
    height: 100%;
    width: 0px;
    background-color: black;

    &.opened {
        width: 250px;
    }
`;
