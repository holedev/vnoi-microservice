import styles from "./ExampleItem.module.css";
import { Box } from "@mui/material";

function ExampleItem({ id, data }) {
    return (
        <Box className={styles.wrapper}>
            <Box className={styles.heading}>
                <h4
                    style={{
                        margin: "12px 0 6px",
                    }}
                >
                    Example {id}
                </h4>
            </Box>
            <Box className={styles.example}>
                <Box className={styles.exampleInp}>
                    <Box className={styles.exampleLabel}>Input:</Box>
                    <Box>{data.input}</Box>
                </Box>
                <Box className={styles.exampleOut}>
                    <Box className={styles.exampleLabel}>Output:</Box>
                    <Box>{data.output}</Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ExampleItem;
