import styles from "./ProblemDetail.module.css";
import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { cpp } from "@codemirror/lang-cpp";
import Split from "react-split";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Modal,
  Tab,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box } from "@mui/system";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import DetailTestCase from "~/components/DetailTestCase";
import useUserContext from "~/hook/useUserContext";
import { handleTimeProblem } from "~/utils/datetime";
import { loadingToast, updateToast } from "~/utils/toast";
import useAxiosAPI from "~/hook/useAxiosAPI";
import Action from "./Action";
import Testcase from "./Testcase";
import Submission from "./Submission";
import { handleValidate, runSchema, submitSchema } from "./validation";
import { toast } from "react-toastify";
import useLoadingContext from "~/hook/useLoadingContext";

const ProblemsDetail = () => {
  const { slug } = useParams();
  const [user] = useUserContext();
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [loading, setLoading] = useLoadingContext();

  const [problem, setProblem] = useState(null);
  const [errRun, setErrRun] = useState(null);
  const [resultCheck, setResultCheck] = useState(null);
  const [consoleP, setConsoleP] = useState(false);
  const [isLoad, setIsLoad] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [testcases, setTestcases] = useState([]);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState("1");

  const getProblem = async (slug) => {
    if (loading) return;
    setLoading(true);
    await axiosAPI
      .get(`${endpoints.problems}/${slug}`)
      .then((res) => {
        const data = res.data?.data;
        const { end, isValid } = handleTimeProblem(
          data.problem.timeStart,
          data.problem.testTime
        );
        const problem = {
          ...data.problem,
          timeEnd: end,
          isValid,
        };
        setProblem(problem);
        setCode(data.problem?.initCode.slice(3, -3));
        setTestcases(data.testcases);
      })
      .catch((err) => {
        err.response.status === 409
          ? toast.error(err.response.data.message)
          : toast.error("Bad Request!");
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleRun = async () => {
    if (isLoad) return;
    setIsLoad(true);
    const input = testcases.map((tc) => tc.input.join("\n") + "\n");
    const output = testcases.map((tc) => tc.output);

    const data = {
      problem: {
        _id: problem._id,
        author: problem.author._id,
        uuid: problem.uuid,
      },
      code: code.trim(),
      testcases: {
        input,
        output,
      },
    };

    const error = handleValidate(runSchema, data);
    if (error) return toast.error(error);

    setErrRun(null);
    setResultCheck(null);
    const toastID = loadingToast("Running ...");
    await axiosAPI
      .post(`${endpoints.problems}/run`, data)
      .then((res) => {
        const results = res.data.data;
        setResultCheck(results);
        updateToast(toastID, "Running success!", "success");
      })
      .catch((err) => {
        err.response.status === 400 && console.log(err?.response?.data.message);
        (err?.response?.data.message && err.response?.status === 422) ||
        err.response?.status === 400
          ? setErrRun(err.response?.data.message)
          : setErrRun("Bad Request!");
        updateToast(toastID, "Something went wrong!", "error");
      })
      .finally(() => setIsLoad(false));
  };

  const handleSubmit = async () => {
    if (isLoad) return;
    setIsLoad(true);
    const data = {
      problem: {
        _id: problem._id,
        author: problem.author._id,
        uuid: problem.uuid,
      },
      code: code.trim(),
    };

    const error = handleValidate(submitSchema, data);
    if (error) return toast.error(error);

    const toastID = loadingToast("Submitting ...");
    setTab("2");
    await axiosAPI
      .post(endpoints.submissions, data)
      .then((res) => {
        updateToast(toastID, "Submited!", "success");
        const data = res.data.data;
        const { submitRemain, ...rest } = data;
        setSubmissions((prev) => {
          return [rest, ...prev];
        });
        setProblem((prev) => {
          return {
            ...prev,
            submitRemain,
          };
        });
      })
      .catch((err) =>
        updateToast(
          toastID,
          err?.response?.data.message || "Submit failure!",
          "error"
        )
      )
      .finally(() => setIsLoad(false));
  };

  useEffect(() => {
    getProblem(slug);
  }, []);

  return (
    <Split
      direction="horizontal"
      gutterSize={5}
      sizes={[50, 50]}
      minSize={500}
      className={clsx("split", styles.wrapper)}
    >
      <Box className={styles.testDesc}>
        <TabContext sx={{ flex: 1, display: "flex" }} value={tab}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <TabList onChange={handleChange}>
              <Tab label="Description" value="1" />
              <Tab label="Submissions" value="2" />
            </TabList>
          </Box>
          <TabPanel
            style={{
              padding: "4px 12px",
            }}
            value="1"
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              problem && <DetailTestCase problem={problem} />
            )}
          </TabPanel>
          <TabPanel
            sx={{
              flex: 1,
              display: "flex",
              overflowY: "hidden",
            }}
            value="2"
          >
            <Submission
              setCode={setCode}
              submissions={submissions}
              setSubmissions={setSubmissions}
              problem={problem?._id}
              user={user?.id}
            />
          </TabPanel>
        </TabContext>
      </Box>
      <Box className={styles.code}>
        <Box className={styles.editor}>
          <CodeMirror
            value={code}
            style={{
              flex: 1,
            }}
            height="100%"
            theme={okaidia}
            extensions={[cpp()]}
            onChange={(editor) => {
              setCode(editor);
            }}
          />
        </Box>
        <Box className={styles.action}>
          <Action
            problem={problem}
            handleSubmit={handleSubmit}
            setConsole={setConsoleP}
            setCode={setCode}
          />
        </Box>
      </Box>

      <Modal
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        open={consoleP}
        onClose={() => setConsoleP(false)}
      >
        <Box className={styles.modalBody}>
          <TabContext value="3">
            <Box sx={{ borderBottom: 1, borderColor: "" }}>
              <TabList>
                <Tab label="Testcase" value="3" />
              </TabList>
            </Box>
            <TabPanel
              sx={{
                padding: "4px 12px",
                maxHeight: "calc(100vh - 160px)",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
              value="3"
            >
              {resultCheck && (
                <Box
                  sx={{
                    marginTop: "6px",
                  }}
                >
                  <Alert severity="info">
                    Pass: {resultCheck.pass}
                    <Chip
                      style={{
                        marginLeft: "4px",
                      }}
                      component={"span"}
                      label={`${resultCheck.time}s`}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  </Alert>
                </Box>
              )}
              {errRun && (
                <Box
                  sx={{
                    marginTop: "6px",
                  }}
                >
                  <Alert severity="error">
                    <pre>{errRun}</pre>
                  </Alert>
                </Box>
              )}
              <Box className={clsx(styles.group, styles.groupWrapper)}>
                <Box className={styles.exampleList}>
                  {testcases?.length > 0 &&
                    testcases.map((tc, index) => {
                      return (
                        <Testcase
                          key={index}
                          data={tc}
                          resultCheck={resultCheck?.data[index]}
                          idx={index}
                        />
                      );
                    })}
                </Box>
              </Box>
            </TabPanel>
          </TabContext>
          <Box
            sx={{
              padding: "4px 12px",
            }}
          >
            <Button
              onClick={handleRun}
              sx={{ width: "100%" }}
              variant="outlined"
            >
              Run
            </Button>
          </Box>
        </Box>
      </Modal>
    </Split>
  );
};

export default ProblemsDetail;
