import { Box } from "@mui/material";
import styles from "./Editor.module.css";
import ReactMarkdown from "react-markdown";
import Split from "react-split";
import clsx from "clsx";
import reactGfm from "remark-gfm";

function Editor({ state, setState }) {
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
        <Split
            direction="horizontal"
            gutterSize={5}
            sizes={[50, 50]}
            minSize={0}
            className={clsx("split", styles.wrapper)}
        >
            <Box className={styles.markdown}>
                <Box className={styles.heading}>Markdown</Box>
                <textarea
                    className={styles.markdownInp}
                    placeholder="Enter markdown here ..."
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    name="editor"
                    id="editor"
                ></textarea>
            </Box>
            <Box className={styles.preview}>
                <Box className={styles.heading}>Preview</Box>
                <ReactMarkdown
                    components={customComponents}
                    className={styles.reactMarkdown}
                    remarkPlugins={[reactGfm]}
                >
                    {state}
                </ReactMarkdown>
            </Box>
        </Split>
    );
}

export default Editor;
