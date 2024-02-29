import styles from "./ProblemTestCase.module.css";
import { Box, TextField } from "@mui/material";

function ProblemTestCase({ id, item, setState }) {
    const handleOnChange = (e, type) => {
        setState((prev) => {
            const item = prev.find((item) => item.id === id);
            item[type] = e.target.value;
            return [...prev];
        });
    };

    return (
        <Box className={styles.wrapper}>
            <Box className={styles.heading}>Test Case {item.id}: </Box>
            <TextField
                value={item.input}
                onChange={(e) => handleOnChange(e, "input")}
                className={styles.testInp}
                size="small"
                id="email"
                label="Input"
                variant="outlined"
                fullWidth
                margin="normal"
                autoComplete="off"
                placeholder="[1, 2, 3, 4]"
            />
            <TextField
                value={item.output}
                onChange={(e) => handleOnChange(e, "output")}
                className={styles.testInp}
                size="small"
                id="email"
                label="Output"
                variant="outlined"
                fullWidth
                margin="normal"
                autoComplete="off"
                placeholder="[4, 3, 2, 1]"
            />
        </Box>
    );
}

export default ProblemTestCase;
