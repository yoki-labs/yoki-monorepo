import { ReactNode, useState } from "react";

import { AccordionBody, AccordionHeader, AccordionWrapper } from "./styles";

interface Props extends React.PropsWithChildren<any> {
    children: ReactNode[];
}

const Accordion: React.FC<Props> = ({ children }) => {
    const [open, setOpen] = useState<boolean>(false);

    const toggleOpen = () => setOpen(!open);

    return (
        <AccordionWrapper>
            <AccordionHeader className={open ? "active" : ""} onClick={() => toggleOpen()}>
                {children[0]}
            </AccordionHeader>
            <AccordionBody className={open ? "active" : ""}>
                <hr />
                {children[1]}
            </AccordionBody>
        </AccordionWrapper>
    );
};

export default Accordion;
