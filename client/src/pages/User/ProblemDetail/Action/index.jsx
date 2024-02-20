import styles from "./Action.module.css";
import { Box, Button } from "@mui/material";
import { AccessTime } from "@mui/icons-material";
import { useRef, useState } from "react";
import CountdownTimer from "~/components/CountdownTimer";
import { toast } from "react-toastify";

function Action({ setConsole, handleSubmit, setCode, problem }) {
    const fileRef = useRef(null);

    const [timer, setTimer] = useState(true);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = file.name.split(".").pop().toLowerCase();
            if (["cpp", "c", "txt"].includes(fileExtension)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileContent = e.target.result;
                    setCode(fileContent.trim());
                };
                reader.onerror = (error) => {
                    toast.error("Error reading file:" + error);
                };
                reader.readAsText(file);
            } else {
                toast.error(
                    "Unsupported file type. Please select a .cpp, .c, or .txt file."
                );
            }
            e.target.value = null;
        }
    };

    return (
        <Box className={styles.wrapper}>
            {problem?.isValid && !problem.alwayOpen && (
                <Button
                    onClick={() => setTimer(!timer)}
                    color="inherit"
                    className={styles.timmer}
                >
                    <AccessTime />
                    {timer && (
                        <CountdownTimer timeEnd={new Date(problem.timeEnd)} />
                    )}
                </Button>
            )}
            <Box className={styles.action}>
                <input
                    ref={fileRef}
                    hidden
                    type="file"
                    accept=".cpp, .c, .txt"
                    onChange={handleFileChange}
                />
                <Button onClick={() => fileRef.current.click()}>
                    Upload File
                </Button>
                <Button onClick={() => setConsole(true)} variant="outlined">
                    Console
                </Button>
                <Button
                    style={{
                        marginLeft: "auto",
                    }}
                    disabled={
                        !problem?.alwayOpen
                            ? !problem?.isValid
                                ? true
                                : false
                            : false || problem?.submitRemain == 0
                    }
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                >
                    Submit ({problem?.submitRemain})
                </Button>
            </Box>
        </Box>
    );
}

export default Action;
