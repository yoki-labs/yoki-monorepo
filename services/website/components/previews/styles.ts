import styled from "styled-components";

export const StatusWrapper = styled.div`
    display: flex;
    padding: 10px;
    position: relative;

    .bg {
        position: absolute;
        border-radius: 10px;
        background-size: 400px;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        filter: blur(1px);
        background-image: var(--status-bg);
    }
    .hammer {
        width: 50px;
        height: 50px;
    }
`;
