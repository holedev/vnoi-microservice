import styles from "./Contrains.module.css";
import { Chip } from "@mui/material";

function Contrains() {
    return (
        <div className={styles.contrains}>
            <h4
                style={{
                    margin: "12px 0 6px",
                }}
            >
                Contrains
            </h4>
            <Chip
                className={styles.contrainItem}
                label={`-231 <= x <= 231 - 1`}
            />
            <Chip
                className={styles.contrainItem}
                label={`-231 <= x <= 231 - 1`}
            />
            <Chip
                className={styles.contrainItem}
                label={`-231 <= x <= 231 - 1`}
            />
        </div>
    );
}

export default Contrains;
