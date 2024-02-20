import { useState } from "react";
import styles from "./Login.module.css";
import { Box, Button, TextField, Link, Alert } from "@mui/material";
import axiosAPI, { endpoints } from "~/configs/axiosAPI";
import { useNavigate } from "react-router-dom";
import useUserContext from "~/hook/useUserContext";
import { isValidateEmail } from "~/utils/validate";

const Signup = () => {
    const nav = useNavigate();
    const [, setUser] = useUserContext();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validate, setValidate] = useState(null);

    const signup = async () => {
        await axiosAPI
            .post(`${endpoints.auth}/signup`, {
                email,
                password,
            })
            .then((res) => {
                const statusCode = res.status;
                const userRes = res.data?.data;

                if (statusCode !== 201) {
                    return setValidate("Something went wrong");
                }

                setUser(userRes);

                nav("/competition");
            })
            .catch((err) => {
                import.meta.env.VITE_MODE === "development" &&
                    console.log(err.response?.data || err);
                setValidate(err.response?.data.message);
            });
    };

    const handleInput = (e, fnSet) => {
        setValidate(null);
        fnSet(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isValidateEmail(email)) {
            return setValidate("Email is not valid!");
        }
        setValidate(null);

        signup();
    };

    return (
        <Box className={styles.wrapper}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.heading}>Signup</h2>
                <TextField
                    value={email}
                    onChange={(e) => handleInput(e, setEmail)}
                    size="small"
                    id="email"
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                />
                <TextField
                    value={password}
                    onChange={(e) => handleInput(e, setPassword)}
                    type="password"
                    size="small"
                    id="password"
                    label="Password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                />
                {validate && <Alert severity="error">{validate}</Alert>}
                <Button
                    type="submit"
                    style={{
                        marginTop: "12px",
                    }}
                    variant="contained"
                    color="success"
                    fullWidth
                >
                    Signup
                </Button>

                <div className={styles.more}>
                    <Link
                        style={{
                            textAlign: "center",
                        }}
                        href="/auth/login"
                    >
                        Login
                    </Link>
                </div>
            </form>
        </Box>
    );
};

export default Signup;
