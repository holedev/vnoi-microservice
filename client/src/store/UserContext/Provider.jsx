import { useEffect, useReducer } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Context from "./Context";
import { cookies } from "~/utils/cookies";
import { handleUserOnlineFirebase } from "~/utils/firebase";
import reducer from "./reducer";

function UserProvider({ children }) {
    const location = useLocation();
    const [user, dispatch] = useReducer(reducer, cookies.get("user") || null);

    useEffect(() => {
        if (user?._id) {
            handleUserOnlineFirebase(
                user._id,
                user.fullName,
                user.avatar,
                user.role
            );
        }
    }, [user?._id]);

    if (user && location.pathname.includes("/auth"))
        return <Navigate to="/competition" replace={true} />;

    if (!user && !location.pathname.includes("/auth")) {
        return <Navigate to="/auth/login" replace={true} />;
    }

    return (
        <Context.Provider value={[user, dispatch]}>{children}</Context.Provider>
    );
}

export default UserProvider;
