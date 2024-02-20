import { toast } from "react-toastify";

const loadingToast = (title) => {
    const toastID = toast.loading(title);
    return toastID;
};

const updateToast = (toastID, title, type) => {
    toast.update(toastID, {
        render: title,
        type: type,
        isLoading: false,
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    });
};

export { loadingToast, updateToast };
