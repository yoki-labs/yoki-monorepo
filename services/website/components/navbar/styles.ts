import styled from "styled-components";

export const NavbarWrapper = styled.div`
    z-index: 10;
    width: 100%;
    height: 100%;

    top: 0;
    position: sticky;

    transition: 0.2s ease;

    a {
        color: white;
        font-size: clamp(18px, 2vw, 22px);
    }

    .wrapper {
        display: flex;
        padding: 20px 35px;
        justify-content: center;
        align-items: center;
        transition: all 0.3s;

        &.scrolled {
            background-color: var(--grey);
        }
    }

    @media (max-width: 600px) {
        .wrapper {
            justify-content: space-between;
            padding: 10px 25px;
        }
    }
`;

export const NavbarItemList = styled.div`
    margin-left: 10rem;
    display: flex;

    transition: 0.3s ease;

    .link {
        padding: 2px 17px;
        margin: 0 4px;
        border-radius: 5px;
        transition: 0.3s ease;

        &:hover {
            background-color: var(--grey-fade);
        }

        &.premium {
            color: var(--guilded-yellow);
        }

        &.invite {
            color: var(--grey);
            background-color: var(--guilded-yellow);
            &:hover {
                color: white;
                background-color: #b79200;
            }
        }
    }

    @media (max-width: 1100px) {
        display: none;
    }
`;

export const Hamburger = styled.div`
    width: 25px;
    height: 18px;

    margin: auto 0;
    position: relative;
    transition: 0.5s ease-in-out;
    cursor: pointer;

    @media (min-width: 1100px) {
        display: none;
        cursor: none;
    }

    span {
        display: block;
        position: absolute;
        height: 3px;
        width: 100%;
        background: white;
        border-radius: 9px;
        opacity: 1;
        left: 0;
        transform: rotate(0deg);
        transition: 0.25s ease-in-out;
    }

    span:nth-child(1) {
        top: 0px;
    }

    span:nth-child(2) {
        top: 7px;
    }

    span:nth-child(3) {
        top: 14px;
    }

    &.sidenav {
        span:nth-child(1) {
            top: 7px;
            transform: rotate(-135deg);
        }

        span:nth-child(2) {
            width: 0px;
        }

        span:nth-child(3) {
            top: 7px;
            transform: rotate(135deg);
        }
    }
`;

export const SideNavbarBg = styled.div`
    z-index: 12;
    top: 0;
    left: 0;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.5);

    &.opened {
        width: 100vw;
        height: 100vh;
    }
`;

export const SideNavbar = styled.div`
    z-index: 14;
    position: fixed;

    top: 0;
    right: 0;
    width: 0px;
    height: 100%;

    background-color: black;
    background-color: var(--primary);
    border-radius: 5px;
    transition: 0.3s ease;

    &.opened {
        padding: 0 20px;
        width: 300px;
    }
`;

export const SideNavbarHeader = styled.div`
    margin: 1.5rem 0;
`;
export const SideNavbarBody = styled.div`
    display: flex;
    flex-direction: column;

    gap: 5px;
    margin: auto 0;
    padding: 1.5rem 0;

    border-top: 1px solid var(--light-grey);
    border-bottom: 1px solid var(--light-grey);

    &:not(.opened) {
        display: none;
    }
`;
export const SideNavbarFooter = styled.div``;

export const SideNavbarItem = styled.div`
    transition: 0.3s ease;
    border-radius: 5px;

    a {
        display: flex;
        padding: 10px;
        justify-content: end;
        width: 100%;
    }

    &:hover,
    &:active,
    &:focus {
        background-color: var(--grey-fade);
    }

    &.header {
        padding: 0;
    }

    .invite {
        transition: 0.3s ease;
        border-radius: 5px;
        color: black;
        background-color: var(--guilded-yellow);
        &:hover {
            background-color: rgb(255, 230, 120);
        }
    }

    .premium {
        color: var(--guilded-yellow);
    }
`;
