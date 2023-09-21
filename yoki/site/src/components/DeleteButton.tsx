import { Button, ButtonProps, Modal, ModalDialog, Typography } from "@mui/joy";
import React, { ReactNode } from "react";
import { DeletionConfirmationModal } from "./DeletionConfirmationModal";

type Props = ButtonProps & {
    itemType: string;
    onConfirm: () => unknown;
};

export default function DeleteButton({ itemType, onConfirm, ...rest }: Props) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)} {...rest} />
            <Modal open={open} onClose={() => setOpen(false)}>
                <DeletionConfirmationModal itemType={itemType} onClose={() => setOpen(false)} onConfirm={() => (setOpen(false), onConfirm())} />
            </Modal>
        </>
    );
}
