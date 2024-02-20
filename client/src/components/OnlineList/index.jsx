import { FiberManualRecord } from "@mui/icons-material";
import {
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { realtimeDB } from "~/configs/firebase";

function OnlineList({ open }) {
    const [onlineList, setOnlineList] = useState([]);

    useEffect(() => {
        const listUserRef = ref(realtimeDB, "users");
        onValue(listUserRef, (snapshot) => {
            const data = snapshot.val();
            const list = [];
            for (let _id in data) {
                if (data[_id].connections !== undefined) {
                    data[_id]._id = _id;
                    list.push(data[_id]);
                }
            }
            setOnlineList(list);
        });
    }, []);

    return (
        <div
            className="online-list"
            style={{
                background: "#fff",
                position: "fixed",
                top: 0,
                bottom: 0,
                right: 0,
                minWidth: 300,
                transform: open ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.15s ease-in-out",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                zIndex: 5,
            }}
        >
            <Typography
                sx={{
                    p: 2,
                }}
                variant="h6"
            >
                User Online ({onlineList?.length})
            </Typography>
            <List
                dense
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                    height: "calc(100vh - 64px)",
                    overflowY: "auto",
                }}
            >
                {onlineList?.map((user) => (
                    <ListItem key={user._id} disablePadding>
                        <ListItemButton
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    alt={user.info.fullName}
                                    src={user.info.avatar}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={user.info.fullName}
                                secondary={user.info.role}
                            />
                            <span>
                                <FiberManualRecord
                                    fontSize="small"
                                    color={"success"}
                                />
                            </span>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default OnlineList;
