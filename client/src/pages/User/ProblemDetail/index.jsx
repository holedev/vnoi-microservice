import styles from "./ProblemDetail.module.css";
import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { cpp } from "@codemirror/lang-cpp";
import Split from "react-split";
import { Alert, Button, Chip, CircularProgress, Modal, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box } from "@mui/system";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import DetailTestCase from "~/components/DetailTestCase";
import useUserContext from "~/hook/useUserContext";
import { handleTimeProblem } from "~/utils/datetime";
import useAxiosAPI from "~/hook/useAxiosAPI";
import Action from "./Action";
import Testcase from "./Testcase";
import Submission from "./Submission";
import { handleValidate, runSchema, submitSchema } from "./validation";
import { toast } from "react-toastify";
import useLoadingContext from "~/hook/useLoadingContext";
import DropdownLanguage from "~/components/Editor/DropdownLanguage";
import { checkRunConsolesQueue, checkSubmissionsQueue } from "~/utils/firebase";
import LinearProgress from "@mui/material/LinearProgress";

const ProblemsDetail = () => {
  const { slug } = useParams();
  const [user] = useUserContext();
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [loading, setLoading] = useLoadingContext();

  const [problem, setProblem] = useState(null);
  const [errRun, setErrRun] = useState(null);
  const [resultCheck, setResultCheck] = useState(null);
  const [consoleP, setConsoleP] = useState(false);
  const [isLoad, setIsLoad] = useState({ run: false, submit: false });
  const [submissions, setSubmissions] = useState([]);
  const [testcases, setTestcases] = useState([]);
  const [code, setCode] = useState({
    langIdSolution: "",
    text: ""
  });
  const [tab, setTab] = useState("1");
  const [uuid, setUuid] = useState(null);

  const getProblem = async (slug) => {
    if (loading) return;
    setLoading(true);
    await axiosAPI
      .get(`${endpoints.problems}/${slug}`)
      .then((res) => {
        const data = res.data?.data;
        const { end, isValid } = handleTimeProblem(data.problem.timeStart, data.problem.testTime);

        const problem = {
          ...data.problem,
          timeEnd: end,
          isValid
        };

        setProblem(problem);
        setCode({
          langIdSolution: data.problem?.langIdSolution,
          text: data.problem?.initCode.slice(3, -3)
        });
        setTestcases(data.testcases);
      })
      .catch((err) => {
        err.response.status === 409 ? toast.error(err.response.data.message) : toast.error("Bad Request!");
      })
      .finally(() => setLoading(false));
  };

  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  const handleChangeLanguage = (langIdSolution) => {
    setCode((prev) => {
      return {
        ...prev,
        langIdSolution: langIdSolution
      };
    });
  };

  const handleRun = async () => {
    if (isLoad.run || isLoad.submit) return;
    setIsLoad((prev) => {
      return { ...prev, run: true };
    });

    const data = {
      problem: {
        _id: problem._id,
        author: problem.author._id,
        uuid: problem.uuid,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        stackLimit: problem.stackLimit
      },
      code: {
        langIdSolution: code.langIdSolution,
        text: code.text.trim()
      },
      testcases
    };

    const error = handleValidate(runSchema, data);
    if (error) {
      setIsLoad((prev) => {
        return { ...prev, run: false };
      });
      toast.error(error);
      return;
    }

    setErrRun(null);
    setResultCheck(null);

    await axiosAPI
      .post(`${endpoints.problems}/run`, data)
      .then((res) => {
        const data = res.data.data;
        const { uuid } = data;
        setUuid(uuid);
      })
      .catch((err) => {
        setIsLoad((prev) => {
          return { ...prev, run: false };
        });
        err.response.status === 400 && console.log(err?.response?.data.message);
        (err?.response?.data.message && err.response?.status === 422) || err.response?.status === 400
          ? setErrRun(err.response?.data.message)
          : setErrRun("Bad Request!");
      });
  };

  const handleSubmit = async () => {
    if (isLoad.run || isLoad.submit) return;
    setIsLoad((prev) => {
      return { ...prev, submit: true };
    });

    const data = {
      problem: {
        _id: problem._id,
        author: problem.author._id,
        uuid: problem.uuid,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        stackLimit: problem.stackLimit
      },
      code: {
        langIdSolution: code.langIdSolution,
        text: code.text.trim()
      }
    };

    const error = handleValidate(submitSchema, data);
    if (error) {
      setIsLoad((prev) => {
        return { ...prev, submit: false };
      });
      toast.error(error);
      return;
    }
    setTab("2");

    await axiosAPI
      .post(endpoints.submissions, data)
      .then((res) => {
        const data = res.data.data;
        const { submitRemain, uuid } = data;
        setProblem((prev) => {
          return {
            ...prev,
            submitRemain: submitRemain - 1
          };
        });
        setUuid(uuid);
      })
      .catch((err) => {
        setIsLoad((prev) => {
          return { ...prev, submit: false };
        });
        toast.error(err?.response?.data.message || "Submit failure!");
      });
  };

  useEffect(() => {
    getProblem(slug);
  }, []);

  useEffect(() => {
    const handleRunConsole = (data) => {
      if (data.uuid !== uuid) return;
      setResultCheck(JSON.parse(data.message));
      setIsLoad((prev) => {
        return { ...prev, run: false };
      });
    };

    const handleSubmission = (data) => {
      if (data.uuid !== uuid) return;
      setSubmissions((prev) => {
        const message = JSON.parse(data.message);
        const lastSubmission = {
          ...message,
          pass: `${message.pass}/${message.total}`
        };
        return [lastSubmission, ...prev];
      });
      setIsLoad((prev) => {
        return { ...prev, submit: false };
      });
    };

    checkRunConsolesQueue(handleRunConsole);
    checkSubmissionsQueue(handleSubmission);
  }, [uuid]);

  return (
    <Split
      direction='horizontal'
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
              borderColor: "divider"
            }}
          >
            <TabList onChange={handleChangeTab}>
              <Tab label='Description' value='1' />
              <Tab label='Submissions' value='2' />
            </TabList>
          </Box>
          <TabPanel
            style={{
              padding: "4px 12px"
            }}
            value='1'
          >
            {loading ? <CircularProgress size={20} /> : problem && <DetailTestCase problem={problem} />}
          </TabPanel>
          <TabPanel
            sx={{
              flex: 1,
              display: "flex",
              overflowY: "hidden"
            }}
            value='2'
          >
            <Submission
              setCode={setCode}
              submissions={submissions}
              setSubmissions={setSubmissions}
              problem={problem?._id}
              user={user?.id}
              isLoad={isLoad}
            />
          </TabPanel>
        </TabContext>
      </Box>
      <Box className={styles.code}>
        <DropdownLanguage
          value={code?.langIdSolution}
          handleChangeLanguage={(langId) => handleChangeLanguage(langId)}
          availableListId={problem?.availableLanguages}
        />
        <Box className={styles.editor}>
          <CodeMirror
            value={code?.text}
            style={{
              flex: 1
            }}
            height='100%'
            lang=''
            theme={okaidia}
            extensions={[cpp()]}
            onChange={(editor) => {
              setCode((prev) => {
                return {
                  ...prev,
                  text: editor
                };
              });
            }}
          />
        </Box>
        <Box className={styles.action}>
          <Action
            isLoad={isLoad}
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
          justifyContent: "center"
        }}
        open={consoleP}
        onClose={() => setConsoleP(false)}
      >
        <Box className={styles.modalBody}>
          <TabContext value='3'>
            <Box sx={{ borderBottom: 1, borderColor: "" }}>
              <TabList>
                <Tab label='Testcase' value='3' />
              </TabList>
            </Box>
            <TabPanel
              sx={{
                padding: "4px 12px",
                maxHeight: "calc(100vh - 160px)",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  display: "none"
                }
              }}
              value='3'
            >
              {isLoad.run && (
                <Box
                  sx={{
                    marginTop: "6px",
                    p: 1
                  }}
                >
                  <LinearProgress />
                </Box>
              )}
              {resultCheck && !isLoad.run && (
                <Box
                  sx={{
                    marginTop: "6px"
                  }}
                >
                  <Alert severity='info'>
                    Pass: {resultCheck.pass}
                    <Chip
                      style={{
                        marginLeft: "4px"
                      }}
                      component={"span"}
                      label={`${resultCheck.timeAvg}s`}
                      size='small'
                      variant='outlined'
                      color='info'
                      title='Time average'
                    />
                    <Chip
                      style={{
                        marginLeft: "4px"
                      }}
                      component={"span"}
                      label={`${resultCheck.memoryAvg}KB`}
                      size='small'
                      variant='outlined'
                      color='info'
                      title='Memory average'
                    />
                  </Alert>
                </Box>
              )}
              {errRun && (
                <Box
                  sx={{
                    marginTop: "6px"
                  }}
                >
                  <Alert severity='error'>
                    <pre>{errRun}</pre>
                  </Alert>
                </Box>
              )}
              <Box className={clsx(styles.group, styles.groupWrapper)}>
                <Box className={styles.exampleList}>
                  {testcases?.length > 0 &&
                    testcases.map((tc, index) => {
                      return <Testcase key={index} data={tc} resultCheck={resultCheck} idx={index} />;
                    })}
                </Box>
              </Box>
            </TabPanel>
          </TabContext>
          <Box
            sx={{
              padding: "4px 12px"
            }}
          >
            <Button onClick={handleRun} sx={{ width: "100%" }} variant='outlined'>
              Run
            </Button>
          </Box>
        </Box>
      </Modal>
    </Split>
  );
};

export default ProblemsDetail;
