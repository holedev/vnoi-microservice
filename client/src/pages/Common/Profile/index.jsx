import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Autocomplete } from "@mui/joy";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import useUserContext from "~/hook/useUserContext";
import { loadingToast, updateToast } from "~/utils/toast";
import { cookies } from "~/utils/cookies";
import useAxiosAPI from "~/hook/useAxiosAPI";
import { handleValidate, updateSchema } from "./validation";

function Profile() {
    const [user, dispatch] = useUserContext();
    const { axiosAPI, endpoints } = useAxiosAPI();

    const [classList, setClassList] = useState([]);
    const [data, setData] = useState({
        studentCode: user?.studentCode || "",
        classCurr: user?.classCurr || "",
        fullName: user?.fullName || "",
        avatar: user?.avatar || null,
    });

    const handleChange = (value, field) => {
        setData((prev) => {
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const getClassList = async () => {
        await axiosAPI.get(`${endpoints.classes}`).then((res) => {
            const classList = res.data?.data;
            setClassList(classList);
            const idx = classList.findIndex((c) => c._id == user?.classCurr);
            handleChange(classList[idx], "classCurr");
        });
    };

    const handleSave = async () => {
        const update = {
            ...data,
            classCurr: data.classCurr?._id,
        };

        const error = handleValidate(updateSchema, update);
        if (error) return toast.error(error);

        const toastID = loadingToast("Updating ...");
        await axiosAPI
            .patch(endpoints.users + "/update", update)
            .then((res) => {
                const data = res.data.data;
                dispatch({
                    type: "UPDATE",
                    payload: {
                        user: data,
                    },
                });
                updateToast(toastID, "Updated!", "success");
            })
            .catch((err) =>
                updateToast(
                    toastID,
                    err.response.data.message || "Something went wrong!",
                    "error"
                )
            );
    };

    const handleCancel = () => {
        const idx = classList.findIndex((c) => c._id == user?.classCurr);
        setData({
            studentCode: user?.studentCode || "",
            classCurr: classList[idx] || "",
            fullName: user?.fullName || "",
            avatar: user?.avatar || null,
        });
    };

    useEffect(() => {
        getClassList();
    }, []);

    return (
        <Box
            sx={{
                flex: 1,
                width: "100%",
            }}
        >
            <Box
                sx={{
                    bgcolor: "#fff",
                    zIndex: 1,
                }}
            >
                <Box>
                    <Typography
                        level="h1"
                        sx={{
                            textAlign: "right",
                            mr: 2,
                        }}
                    >
                        PROFILE
                    </Typography>
                </Box>
                <Tabs
                    defaultValue={0}
                    sx={{
                        bgcolor: "transparent",
                    }}
                >
                    <TabList
                        tabFlex={1}
                        size="sm"
                        sx={{
                            pl: {
                                xs: 0,
                                md: 4,
                            },
                            justifyContent: "right",
                            [`&& .${tabClasses.root}`]: {
                                flex: "initial",
                                bgcolor: "transparent",
                                [`&.${tabClasses.selected}`]: {
                                    fontWeight: "600",
                                    "&::after": {
                                        height: "2px",
                                        bgcolor: "primary.500",
                                    },
                                },
                            },
                        }}
                    >
                        <Tab
                            sx={{ borderRadius: "6px 6px 0 0" }}
                            indicatorInset
                            value={0}
                        >
                            Settings
                        </Tab>
                    </TabList>
                </Tabs>
            </Box>

            <Stack
                spacing={4}
                sx={{
                    display: "flex",
                    maxWidth: "1200px",
                    mx: "auto",
                    px: {
                        xs: 2,
                        md: 6,
                    },
                    py: {
                        xs: 2,
                        md: 3,
                    },
                }}
            >
                <Card>
                    <Box sx={{ mb: 1 }}>
                        <Typography level="title-md">Personal info</Typography>
                        <Typography level="body-sm">
                            Customize how your profile information will apper to
                            the networks.
                        </Typography>
                    </Box>
                    <Divider />
                    <Stack
                        direction="row"
                        spacing={3}
                        sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
                    >
                        <Stack direction="column" spacing={1}>
                            <AspectRatio
                                ratio="1"
                                maxHeight={200}
                                sx={{
                                    flex: 1,
                                    minWidth: 160,
                                    borderRadius: "100%",
                                }}
                            >
                                <img src={user?.avatar} loading="lazy" alt="" />
                            </AspectRatio>
                            <IconButton
                                size="sm"
                                variant="outlined"
                                color="neutral"
                                sx={{
                                    bgcolor: "#fff",
                                    position: "absolute",
                                    zIndex: 2,
                                    borderRadius: "50%",
                                    left: 140,
                                    top: 210,
                                    boxShadow: "sm",
                                }}
                            >
                                <EditRoundedIcon />
                            </IconButton>
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
                                        value={data.studentCode}
                                        onChange={(e) =>
                                            handleChange(
                                                e.target.value,
                                                "studentCode"
                                            )
                                        }
                                    />
                                </FormControl>

                                <FormControl sx={{ flexGrow: 1 }}>
                                    <FormLabel>Class</FormLabel>
                                    {classList.length > 0 && (
                                        <Autocomplete
                                            value={data.classCurr}
                                            placeholder="Class"
                                            options={classList}
                                            onChange={(event, newValue) =>
                                                handleChange(
                                                    newValue,
                                                    "classCurr"
                                                )
                                            }
                                            getOptionLabel={(option) =>
                                                option.name
                                            }
                                        />
                                    )}
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
                                            handleChange(
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
                                    <Input
                                        size="sm"
                                        defaultValue={user.role}
                                        disabled
                                    />
                                </FormControl>
                                <FormControl sx={{ flexGrow: 1 }}>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        size="sm"
                                        type="email"
                                        startDecorator={<EmailRoundedIcon />}
                                        placeholder="email"
                                        defaultValue={user.email}
                                        sx={{ flexGrow: 1 }}
                                        disabled
                                    />
                                </FormControl>
                            </Stack>
                            <div></div>
                        </Stack>
                    </Stack>

                    <CardOverflow
                        sx={{ borderTop: "1px solid", borderColor: "divider" }}
                    >
                        <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                            <Button
                                onClick={handleCancel}
                                size="sm"
                                variant="outlined"
                                color="neutral"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                size="sm"
                                variant="solid"
                            >
                                Save
                            </Button>
                        </CardActions>
                    </CardOverflow>
                </Card>
            </Stack>
        </Box>
    );
}

export default Profile;
