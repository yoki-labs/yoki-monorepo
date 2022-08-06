import styled from "styled-components";

export const CommandNavigation = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 250px;

    position: sticky;
    top: 8rem;

    height: fit-content;
    color: white;

    padding: 20px;
    border-radius: 5px;
    background-color: var(--grey);

    a {
        margin: 0;
        padding: 5px 10px;
        border-radius: 5px;
        color: var(--guilded-yellow);
        transition: all 0.2s;
    }

    a:hover {
        background-color: var(--grey-fade);
    }

    a.active {
        background-color: var(--guilded-yellow);
        color: black;
    }

    & a {
        text-decoration: none;
    }
`;

export const UpArrow = styled.i`
    border: solid var(--light-grey);
    border-width: 0 3px 3px 0;
    padding: 3px;
    display: inline-block;
    transform: rotate(-135deg);
    -webkit-transform: rotate(-135deg);
`;

export const CommandTop = styled.a`
    padding: 5px 10px;
    border-radius: 5px;

    &:hover {
        cursor: pointer;
        background-color: var(--grey-fade);
    }
`;

export const Category = styled.h1`
    color: var(--guilded-yellow);
    scroll-margin-top: 8rem;
`;
