import styles from "./Edit.module.css";
import {
    AspectRatio,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Modal,
    ModalDialog,
    Autocomplete,
    Select,
    Option,
} from "@mui/joy";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import { useState } from "react";
import useAxiosAPI from "~/hook/useAxiosAPI";
import { loadingToast, updateToast } from "~/utils/toast";

function Edit({
    setListUser,
    edit,
    setEdit,
    user,
    setUser,
    classList,
    ...props
}) {
    const { axiosAPI, endpoints } = useAxiosAPI();

    const [data, setData] = useState(() => {
        const idx = classList.findIndex((c) => c._id == user?.classCurr?._id);
        return {
            studentCode: user?.studentCode || "",
            classCurr: classList[idx] || "",
            fullName: user?.fullName || "",
            avatar: user?.avatar || "",
            role: user?.role || "",
            email: user?.email || "",
        };
    });

    const handleEditUser = (value, field) => {
        setData((prev) => {
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const handleClose = () => {
        setUser(null);
        setEdit(false);
    };

    const handleUpdate = async () => {
        const toastID = loadingToast("Updating ...");
        await axiosAPI
            .patch(endpoints.users + "/update/" + user._id, {
                ...data,
                classCurr: data.classCurr?._id,
            })
            .then((res) => {
                updateToast(toastID, "Update success!", "success");
                const data = res.data.data;
                setListUser((prev) => {
                    const idx = prev.findIndex((u) => u._id === data._id);
                    prev[idx] = data;
                    return [...prev];
                });
                setUser(null);
                setEdit(false);
            })
            .catch(() => updateToast(toastID, "Update Fail!", "error"));
    };

    return (
        <Modal {...props} open={edit} onClose={handleClose}>
            <ModalDialog
                style={{
                    padding: "12px",
                }}
            >
                <DialogTitle id="responsive-dialog-title">
                    Update USER
                </DialogTitle>
                <DialogContent>
                    <Stack
                        direction="row"
                        spacing={3}
                        sx={{ display: { md: "flex" }, my: 1 }}
                    >
                        <Stack
                            direction="column"
                            sx={{
                                position: "relative",
                            }}
                            spacing={1}
                        >
                            <AspectRatio
                                ratio="1"
                                maxHeight={200}
                                sx={{
                                    flex: 1,
                                    minWidth: 120,
                                    borderRadius: "100%",
                                }}
                            >
                                <img
                                    src={data?.avatar}
                                    loading="lazy"
                                    alt="avt"
                                />
                            </AspectRatio>
                        </Stack>
                        <Stack spacing={2} sx={{ flexGrow: 1 }}>
                            <Stack
                                sx={{
                                    alignItems: "center",
                                }}
                                direction="row"
                                spacing={2}
                            >
                                <FormControl sx={{ flexGrow: 1 }}>
                                    <FormLabel>Student Code</FormLabel>
                                    <Input
                                        size="sm"
                                        value={data?.studentCode}
                                        onChange={(e) =>
                                            handleEditUser(
                                                e.target.value,
                                                "studentCode"
                                            )
                                        }
                                    />
                                </FormControl>

                                <FormControl sx={{ flexGrow: 1 }}>
                                    <FormLabel>Class</FormLabel>
                                    <Autocomplete
                                        disableportal="true"
                                        value={data?.classCurr}
                                        placeholder="Class"
                                        options={classList}
                                        onChange={(event, newValue) =>
                                            handleEditUser(
                                                newValue,
                                                "classCurr"
                                            )
                                        }
                                        getOptionLabel={(option) =>
                                            option?.name || ""
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                            value === undefined ||
                                            value === "" ||
                                            value == {} ||
                                            option.name === value.name
                                        }
                                    />
                                </FormControl>
                            </Stack>
                            <Stack spacing={1}>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl
                                    sx={{
                                        display: {
                                            sm: "flex-column",
                                            md: "flex-row",
                                        },
                                        gap: 2,
                                    }}
                                >
                                    <Input
                                        size="sm"
                                        placeholder="Full Name here ..."
                                        value={data.fullName}
                                        onChange={(e) =>
                                            handleEditUser(
                                                e.target.value,
                                                "fullName"
                                            )
                                        }
                                    />
                                </FormControl>
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <FormControl>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        sx={{ flexGrow: 1, px: 1 }}
                                        size="small"
                                        value={data.role || ""}
                                        onChange={(event, value) =>
                                            handleEditUser(value, "role")
                                        }
                                    >
                                        <Option sx={{ px: 1 }} value="STUDENT">
                                            STUDENT
                                        </Option>
                                        <Option sx={{ px: 1 }} value="LECTURER">
                                            LECTURER
                                        </Option>
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ flexGrow: 1 }}>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        size="sm"
                                        type="email"
                                        startDecorator={<EmailRoundedIcon />}
                                        placeholder="email"
                                        defaultValue={data?.email}
                                        sx={{ flexGrow: 1 }}
                                        disabled
                                    />
                                </FormControl>
                            </Stack>
                            <div></div>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: "flex",
                        gap: "4px",
                    }}
                >
                    <Button onClick={handleUpdate} autoFocus>
                        Update
                    </Button>
                    <Button autoFocus onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </ModalDialog>
        </Modal>
    );
}

export default Edit;
