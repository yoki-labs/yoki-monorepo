import styled from "styled-components";

export const AccordionWrapper = styled.div`
    display: flex;
    flex-direction: column;

    min-width: 250px;
    padding: 10px;
    margin: auto;

    border-radius: 5px;
    background-color: var(--grey);
`;

export const AccordionHeader = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    transition: all 0.2s ease;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    border-radius: 5px;

    &:hover {
        background-color: var(--grey-fade);
        cursor: pointer;
    }

    &.active::after {
        content: "-";
        color: white;
        font-size: 2rem;
        margin-left: auto;
        align-self: center;
    }

    &:not(.active)::after {
        content: "+";
        color: white;
        font-size: 2rem;
        margin-left: auto;
        align-self: center;
    }
`;

export const AccordionHeaderText = styled.span`
    color: var(--guilded-yellow);
    color: white;
    user-select: none;
    font-size: 1.5rem;
`;

export const AccordionBody = styled.div`
    width: 100%;
    min-height: fit-content + 100px;
    transition: max-height 0.3s ease, opacity 0.2s ease, padding 0.1s ease;
    padding: 5px 10px;
    // Using max-height to allow animation for open/closing
    max-height: 2000px;

    hr {
        border: 1px solid var(--light-grey);
        margin-bottom: 1rem;
    }

    &:not(.active) {
        max-height: 0;
        opacity: 0;
        padding: 0;
        overflow: hidden;
    }
`;

export const AccordionBodyContent = styled.div`
    color: white;

    .role {
        color: black;
        font-weight: 600;
        border-radius: 5px;
        background-color: var(--guilded-yellow);
    }

    span {
        font-family: Avenir, Helvetica, Arial, sans-serif;
    }

    code {
        word-wrap: normal;
        width: fit-content;
        border-radius: 3px;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(0, 0, 0, 0.3);
    }

    hr {
        margin: 1rem 0;
    }
`;
