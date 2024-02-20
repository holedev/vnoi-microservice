import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { Box, Button } from "@mui/material";
import useUserContext from "~/hook/useUserContext";
import { google } from "~/assets/images";
import { loadingToast, updateToast } from "~/utils/toast";
import useAxiosAPI from "~/hook/useAxiosAPI";

const Login = () => {
    const nav = useNavigate();
    const [, dispatch] = useUserContext();
    const { axiosAPI, endpoints } = useAxiosAPI();

    const handleLoginGoogle = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        const data = {
            uid: res.user.uid,
            email: res.user.email,
            avatar: res.user.photoURL,
            fullName: res.user.displayName,
        };

        const toastID = loadingToast("Login ...");
        await axiosAPI
            .post(endpoints.auth, data)
            .then((res) => {
                updateToast(toastID, "Login success!", "success");
                const { isUpdate, ...user } = res.data.data;
                dispatch({
                    type: "LOGIN",
                    payload: {
                        isUpdate,
                        user,
                    },
                });

                data.role === "LECTURER"
                    ? nav("/lecturer/dashboard")
                    : nav("/competition");
            })
            .catch((err) => {
                updateToast(
                    toastID,
                    err.response.data.message || "Login fail!",
                    "error"
                );
            });
    };

    return (
        <Box className={styles.wrapper}>
            <Button onClick={handleLoginGoogle} className={styles.btnLogin}>
                <img
                    className={styles.loginLogo}
                    src={google}
                    alt="LOGO GOOGLE"
                />
                <div className={styles.loginText}>Login with Google</div>
            </Button>
        </Box>
    );
};

export default Login;
