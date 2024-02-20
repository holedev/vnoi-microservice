import { AccessTimeFilled } from "@mui/icons-material";
import styles from "./DetailTestCase.module.css";
import { Box, Chip } from "@mui/material";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import gfm from "remark-gfm";

function DetailTestCase({ problem }) {
    const customComponents = {
        table: (props) => (
            <table style={{ borderCollapse: "collapse" }}>
                {props.children}
            </table>
        ),
        th: (props) => (
            <th style={{ padding: "6px 13px", border: "1px solid black" }}>
                {props.children}
            </th>
        ),
        td: (props) => (
            <td style={{ padding: "6px 13px", border: "1px solid black" }}>
                {props.children}
            </td>
        ),
        p: (props) => <p style={{ lineHeight: "1.5" }}>{props.children}</p>,
    };

    return (
        <Box>
            <div className={styles.heading}>
                <div className={styles.headingLeft}>
                    <h3
                        style={{
                            margin: "12px 0",
                        }}
                    >
                        {problem.title}
                    </h3>
                    <Chip
                        sx={{
                            marginLeft: "4px",
                        }}
                        label={
                            problem.level == 0
                                ? "Easy"
                                : problem.level == 1
                                ? "Medium"
                                : "Hard"
                        }
                    />
                </div>
                {problem.testTime && (
                    <div className={styles.headingRight}>
                        <Chip
                            icon={<AccessTimeFilled />}
                            label={problem.testTime + " min"}
                        />
                    </div>
                )}
            </div>
            <ReactMarkdown
                components={customComponents}
                className={styles.descriptions}
                remarkPlugins={[gfm]}
            >
                {problem.desc}
            </ReactMarkdown>
        </Box>
    );
}

export default DetailTestCase;
