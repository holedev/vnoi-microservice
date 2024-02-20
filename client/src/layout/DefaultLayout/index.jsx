import { Fab } from "@mui/material";
import Sidebar from "../Sidebar";
import useUserContext from "../../hook/useUserContext";
import { SupervisedUserCircle } from "@mui/icons-material";
import { useEffect, useState } from "react";
import OnlineList from "~/components/OnlineList";
import { useLocation } from "react-router-dom";

function DefaultLayout({ children }) {
    const [user] = useUserContext();
    const location = useLocation();

    const [onlineList, setOnlineList] = useState(false);

    useEffect(() => {
        window.addEventListener("click", (e) => {
            const btn = e.target.closest(".toggle-online-list");
            const onlineList = e.target.closest(".online-list");

            if (!btn && !onlineList) {
                setOnlineList(false);
            }
        });

        return () => {
            window.removeEventListener("click", () => {});
        };
    }, []);

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
            }}
        >
            {user && <Sidebar />}
            <div
                style={{
                    flex: 1,
                }}
            >
                {children}
            </div>
            {["/competition"].includes(location.pathname) &&
                (user?.role === "ADMIN" || user?.role === "LECTURER") && (
                    <Fab
                        title="Online List"
                        className="toggle-online-list"
                        sx={{
                            position: "fixed",
                            bottom: 16,
                            right: 16,
                        }}
                        color="primary"
                        size="small"
                        onClick={() => setOnlineList(!onlineList)}
                    >
                        <SupervisedUserCircle />
                    </Fab>
                )}
            <OnlineList open={onlineList} />
        </div>
    );
}

export default DefaultLayout;
