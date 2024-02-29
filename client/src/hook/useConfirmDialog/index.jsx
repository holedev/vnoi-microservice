import { useState } from "react";
import AlertDialog from "~/components/AlertDialog";

function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [resolve, setResolve] = useState(null);
    const [data, setData] = useState(null);

    const confirm = (title, content) => {
        return new Promise((res) => {
            setData({
                title,
                content,
            });
            setIsOpen(true);
            setResolve(() => res);
        });
    };

    const handleClose = (result) => {
        setIsOpen(false);
        resolve(result);
    };

    const component = isOpen ? (
        <AlertDialog
            open={isOpen}
            setOpen={setIsOpen}
            title={data.title}
            content={data.content}
            handleAction={() => handleClose(true)}
            handleClose={() => handleClose(false)}
        />
    ) : null;

    return [confirm, component];
}

export default useConfirmDialog;
