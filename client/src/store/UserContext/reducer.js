import { getAuth } from "firebase/auth";
import { cookies } from "~/utils/cookies";

const auth = getAuth();

export default (state, { type, payload }) => {
    switch (type) {
        case "LOGIN":
            payload.isUpdate ? auth.currentUser.getIdToken(true) : null;
            cookies.set("user", payload.user);
            return payload.user;

        case "UPDATE":
            cookies.set("user", payload.user);
            return payload.user;

        case "LOGOUT":
            auth.signOut();
            cookies.set("user", null);
            return null;

        default:
            return state;
    }
};
