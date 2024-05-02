import styles from './Problem.module.css';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Modal,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { CopyAll, UploadFile } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import Editor from '~/components/Editor';
import useUserContext from '~/hook/useUserContext';
import { useNavigate, useParams } from 'react-router-dom';
import DropdownClass from '~/components/DropdownClass';
import { loadingToast, updateToast } from '~/utils/toast';
import useAxiosAPI from '~/hook/useAxiosAPI';
import Tutorial from '~/components/Tutorial';
import { createSchema, handleValidate, updateSchema } from './validation';
import { steps } from './tutorial';
import AutocompleteLanguage from '~/components/Editor/AutocompleteLanguage';
import DropdownLanguage from '~/components/Editor/DropdownLanguage';

function AdminProblem() {
  const nav = useNavigate();
  const fileRef = useRef(null);
  const fileTCRef = useRef(null);

  const { axiosAPI, endpoints } = useAxiosAPI();
  const [user] = useUserContext();
  const { slug } = useParams();

  const [tutorial, setTutorial] = useState(false);
  const [useFileTC, setUseFileTC] = useState(false);
  const [dataTC, setDataTC] = useState(null);
  const [data, setData] = useState({
    title: '',
    level: 0,
    timeStart: dayjs(),
    testTime: 60,
    desc: '',
    script: {
      generateCode: '```\nfunction generateScript() {\n\n}\n```',
      quantity: 50,
      data: [],
      file: false,
    },
    initCode: '```\nint main() {\n\t\n}\n```',
    langIdSolution: 54,
    solution: "```\nint main() {\n\tcout('Hello World');\n\treturn 0;\n}\n```",
    classCurr: user.classCurr?._id,
    alwayOpen: false,
    timeLimit: 1, // second
    memoryLimit: 2048, // kilobyte
    stackLimit: 2048, // kilobyte
    availableLanguages: new Set([54, 62, 63, 71]), // utils/compiler/data.js
  });

  const getProblem = async (slug) => {
    await axiosAPI.get(endpoints.problems + `/edit/${slug}`).then((res) => {
      const data = res.data.data;
      setData({
        title: data.title,
        level: data.level,
        timeStart: dayjs(data.timeStart),
        testTime: parseInt(data.testTime) || 0,
        desc: data.desc,
        script: {
          quantity: parseInt(data.testcases.quantity) || 50,
          generateCode: data.testcases.generateCode || undefined,
          file: data.testcases.file,
        },
        initCode: data.initCode,
        solution: data.solution,
        classCurr: data.class?._id,
        uuid: data.uuid,
        alwayOpen: data.alwayOpen || false,
        timeLimit: data.timeLimit || 1,
        memoryLimit: data.memoryLimit || 2048,
        stackLimit: data.stackLimit || 2048,
        availableLanguages: data.availableLanguages,
      });
      setUseFileTC(data.testcases.file);
    });
  };

  const handleData = (value, field) => {
    setData((prev) => {
      prev = {
        ...prev,
        [field]: value,
      };
      return prev;
    });
  };

  const handleChangeStateTC = () => {
    if (!useFileTC) fileTCRef.current.click();
    setUseFileTC(!useFileTC);
    setData((prev) => {
      return {
        ...prev,
        script: {
          ...prev.script,
          file: !useFileTC,
        },
      };
    });
  };

  const handleUploadTCFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (['txt'].includes(fileExtension)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileContent = e.target.result;
          const lines = fileContent.split('\n');
          const firstLine = lines[0].split(' ');

          const quantity = Number(firstLine[0]);
          const linePerTestcase = Number(firstLine[1]);

          if (firstLine.length !== 2 || !quantity || !linePerTestcase) {
            toast.error(
              'First line must only have number of quantity testcase and line per testcase!'
            );
            return;
          }

          const data = lines.slice(1);
          const tcLength = quantity * linePerTestcase;

          if (data.length === tcLength) {
            toast.error('You must have a empty line at the end of file!');
            return;
          }

          if (data.length - tcLength !== 1) {
            toast.error(
              'Data testcase not match with quantity and line per testcase!'
            );
            return;
          }

          const requestData = [];
          for (let i = 0; i < quantity; i++) {
            const start = i * linePerTestcase;
            const end = start + linePerTestcase;
            requestData.push(data.slice(start, end).join('\n') + '\n');
          }

          setData((prev) => {
            return {
              ...prev,
              script: {
                generateCode: undefined,
                file: true,
                quantity: quantity,
                data: requestData,
              },
            };
          });

          toast.success('Upload success!');
        };
        reader.onerror = (error) => {
          toast.error('Error reading file:', error);
        };
        reader.readAsText(file);
      } else {
        toast.error('Unsupported file type. Please select a .txt file.');
      }
      e.target.value = null;
    }
  };

  const generateRandomTestcase = () => {
    try {
      const code = data.script.generateCode.slice(3, -3);
      const fnStr = `return (${code})()`;
      const fn = new Function(fnStr);

      const res = Array(parseInt(data.script.quantity))
        .fill(null)
        .map(() => {
          return fn();
        });

      return res;
    } catch (err) {
      toast.error('Error generate testcase!');
      return;
    }
  };

  const handleScriptGenerateTestcase = () => {
    if (!useFileTC) {
      const data = generateRandomTestcase();
      if (data && Array.from(data)) setDataTC(data);
    } else {
      setDataTC(data.script.data);
    }
  };

  const handleUploadSolution = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (['cpp', 'c', 'txt'].includes(fileExtension)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileContent = e.target.result;
          setData((prev) => {
            return {
              ...prev,
              solution: '```\n' + fileContent.trim() + '\n```',
            };
          });
        };
        reader.onerror = (error) => {
          toast.error('Error reading file:', error);
        };
        reader.readAsText(file);
      } else {
        toast.error(
          'Unsupported file type. Please select a .cpp, .c, or .txt file.'
        );
      }
      e.target.value = null;
    }
  };

  const handleScriptG = (val, field) => {
    setData((prev) => {
      prev = {
        ...prev,
        script: {
          ...prev.script,
          [field]: val,
        },
      };
      return prev;
    });
  };

  const submitF = async (data) => {
    let endpoint = endpoints.problems;
    let mode = 'Create';
    let method = 'post';
    const isUpdateMode = slug && slug !== '__new';
    if (isUpdateMode) {
      endpoint = endpoints.problems + '/edit/' + slug;
      mode = 'Update';
      method = 'patch';
    }

    if (data.alwayOpen) {
      delete data.timeStart;
      delete data.testTime;
    }

    data.availableLanguages = Array.from(data.availableLanguages).sort();

    const schema = mode === 'Create' ? createSchema : updateSchema;

    const isPrevDate = dayjs(data.timeStart).isBefore(dayjs());
    if (isPrevDate) return toast.error(`"Time start" must be after now!`);

    const error = handleValidate(schema, data);
    
    if (error) return toast.error(error);

    const toastID = loadingToast(
      mode === 'Create' ? 'Creating ...' : 'Updating ...'
    );

    await axiosAPI[method](endpoint, data)
      .then(() => {
        updateToast(
          toastID,
          mode === 'Create' ? 'Created!' : 'Updated!',
          'success'
        );
        nav('/lecturer/dashboard');
      })
      .catch((err) => {
        import.meta.env.VITE_MODE === 'development' &&
          console.log(err?.response?.data?.message || err);
        updateToast(
          toastID,
          err.response.data.message || 'Something went wrong!',
          'error'
        );
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // eslint-disable-next-line no-unused-vars
    const { scriptGTestcase, ...rest } = data;

    let problem = null;

    if (data.script.file) {
      problem = {
        ...rest,
        script: {
          generateCode: undefined,
          quantity: parseInt(data.script.quantity),
          data: data.script.data,
          file: true,
        },
      };
    } else {
      const dataTC = generateRandomTestcase();
      if (!dataTC) return;
      problem = {
        ...rest,
        script: {
          generateCode: data.script.generateCode,
          quantity: parseInt(data.script.quantity),
          data: dataTC,
          file: false,
        },
      };
    }
    submitF(problem);
  };

  const handleFilter = (value) => {
    setData((prev) => {
      prev = {
        ...prev,
        classCurr: value,
      };
      return prev;
    });
  };

  const handleCopyTC = () => {
    navigator.clipboard.writeText(dataTC.join(''));
    toast.success('Copied!');
  };

  // TODO: Rewrite or remove this
  const handleSuggestMain = () => {
    const main =
      '```\nint main() {\r\n    std::ifstream iFile("/app/input.txt");\r\n    std::ofstream oFile("/app/output.txt");\r\n    \r\n    if (!iFile) {\r\n        std::cerr << "Failed to open input.txt" << std::endl;\r\n        return 1;\r\n    }\r\n    if (!oFile) {\r\n        std::cerr << "Failed to open output.txt" << std::endl;\r\n        return 1;\r\n    }\r\n\r\n    int quantity, line_per_testcase;\r\n    iFile >> quantity >> line_per_testcase; \r\n    \r\n    while (quantity--) {\r\n        \r\n    }\r\n    \r\n    return 0;\r\n}\n```';

    setData((prev) => {
      return {
        ...prev,
        solution: main,
      };
    });
  };

  useEffect(() => {
    if (slug && slug !== '__new') {
      getProblem(slug);
    }
  }, [slug]);

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.wrapper}>
        <Box className={styles.group}>
          <h5 className={styles.heading}>Problem</h5>
          <Box className={styles.headingBody}>
            <Box className={styles.headingLeft}>
              <TextField
                data-tour="problem-title"
                value={data.title}
                onChange={(e) => handleData(e.target.value, 'title')}
                className={styles.problemTitleInp}
                size="small"
                label="Title"
                id="title"
                variant="outlined"
                margin="normal"
                autoComplete="off"
                placeholder="Two Of Sum"
              />
            </Box>
            <Box className={styles.headingRight}>
              <Tabs
                data-tour="problem-level"
                value={data.level}
                onChange={(_, value) => handleData(value, 'level')}
                centered
              >
                <Tab label="Easy" />
                <Tab label="Medium" />
                <Tab label="Hard" />
              </Tabs>
              <Box
                sx={{
                  display: 'flex',
                  gap: '12px',
                }}
                data-tour="problem-time"
              >
                <DateTimePicker
                  disabled={data.alwayOpen}
                  value={data.timeStart}
                  onChange={(e) => handleData(e, 'timeStart')}
                  label="Time start"
                  size="small"
                />
                <TextField
                  disabled={data.alwayOpen}
                  value={data.testTime}
                  onChange={(e) => handleData(e.target.value, 'testTime')}
                  className={styles.problemTimeInp}
                  size="small"
                  label="Time (minutes)"
                  id="title"
                  variant="outlined"
                  margin="normal"
                  autoComplete="off"
                  placeholder="60"
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box data-tour="problem-desc" className={styles.group}>
          <h5 className={styles.heading}>Problem Description</h5>
          <Editor
            state={data.desc}
            setState={(value) => handleData(value, 'desc')}
          />
        </Box>
        <Box data-tour="problem-solution" className={styles.group}>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept=".cpp, .c, .txt"
            onChange={handleUploadSolution}
          />
          <h5 className={styles.heading}>
            Solution
            <Button
              sx={{
                ml: 1,
              }}
              onClick={() => handleSuggestMain()}
            >
              GENERATE MAIN
            </Button>
            <IconButton
              data-tour="upload-btn"
              onClick={() => fileRef.current.click()}
              aria-label="fingerprint"
              color="primary"
              sx={{
                ml: 1,
              }}
            >
              <UploadFile />
            </IconButton>
            <DropdownLanguage
              sx={{ ml: 3 }}
              value={data.langIdSolution}
              handleChangeLanguage={(langId) =>
                setData((prev) => {
                  return {
                    ...prev,
                    langIdSolution: langId,
                  };
                })
              }
            />
          </h5>
          <Editor
            state={data.solution}
            setState={(value) => handleData(value, 'solution')}
          />
        </Box>
        <Box
          sx={{
            paddingTop: '12px',
            paddingBottom: '12px',
          }}
          className={styles.group}
        >
          <Box>
            <h5 className={styles.heading}>Select languages for user</h5>
          </Box>
          <Box>
            <AutocompleteLanguage
              availableLangList={Array.from(data.availableLanguages).sort()}
              updateLangList={({ type, value }) => {
                setData((prev) => {
                  if (type === 'REMOVE_ID') {
                    return {
                      ...prev,
                      availableLanguages: new Set(
                        Array.from(prev.availableLanguages).filter(
                          (langId) => langId !== value
                        )
                      ),
                    };
                  }

                  return {
                    ...prev,
                    availableLanguages: new Set([
                      ...prev.availableLanguages,
                      value,
                    ]),
                  };
                });
              }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: '12px',
            paddingBottom: '12px',
          }}
          className={styles.group}
        >
          <h5 className={styles.heading}>Limit (per testcase)</h5>
          <Box
            sx={{
              display: 'flex',
              gap: '6px',
              marginLeft: 'auto',
            }}
          >
            <Box>
              <TextField
                title="Time limit (max 2 second)"
                value={data.timeLimit}
                size="small"
                id="outlined-basic"
                label="Time limit (second)"
                variant="outlined"
                type="number"
              />
            </Box>
            <Box>
              <TextField
                title="Memory limit (max 128000 kb)"
                value={data.memoryLimit}
                size="small"
                id="outlined-basic"
                label="Memory limit (kilobyte)"
                variant="outlined"
                type="number"
              />
            </Box>
            <Box>
              <TextField
                title="Stack limit (max 64000 kb)"
                value={data.stackLimit}
                size="small"
                id="outlined-basic"
                label="Stack limit (kilobyte)"
                variant="outlined"
                type="number"
              />
            </Box>
          </Box>
        </Box>
        <Box data-tour="problem-testcase" className={styles.group}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <h5 className={styles.heading}>
              Testcase with {!useFileTC ? 'Script' : 'File'}
            </h5>
            {!useFileTC && (
              <TextField
                disabled={useFileTC}
                value={data.script.quantity}
                onChange={(e) => handleScriptG(e.target.value, 'quantity')}
                size="small"
                id="outlined-basic"
                label="Quantity"
                variant="outlined"
              />
            )}
            <Button
              data-tour="testcase-btn"
              onClick={handleScriptGenerateTestcase}
            >
              Test
            </Button>
            <input
              ref={fileTCRef}
              hidden
              type="file"
              accept=".txt"
              onChange={handleUploadTCFile}
            />
            <FormControlLabel
              sx={{
                ml: 'auto',
              }}
              data-tour="testcase-with-file"
              control={
                <Switch
                  checked={useFileTC || false}
                  onChange={handleChangeStateTC}
                />
              }
              label="USE FILE .TXT"
            />
          </Box>
          {!useFileTC && (
            <Editor
              state={data.script?.generateCode}
              setState={(value) => {
                if (!useFileTC) handleScriptG(value, 'generateCode');
              }}
            />
          )}
        </Box>
        <Box data-tour="problem-init" className={styles.group}>
          <h5 className={styles.heading}>Init Solution</h5>
          <Editor
            state={data.initCode}
            setState={(value) => handleData(value, 'initCode')}
          />
        </Box>
        <Box
          data-tour="problem-action"
          className={clsx(styles.group, styles.groupSubmit)}
        >
          <Button
            sx={{
              marginRight: 'auto',
            }}
            data-tour="action-tutorial"
            variant="text"
            color="info"
            onClick={() => {
              setTutorial(true);
            }}
          >
            Tutorial
          </Button>
          <FormControlLabel
            data-tour="action-alway-open"
            control={
              <Switch
                checked={data.alwayOpen || false}
                onChange={(event) =>
                  handleData(event.target.checked, 'alwayOpen')
                }
              />
            }
            label="ALWAY OPEN"
          />
          <DropdownClass
            withoutOlympic={false}
            withoutAll={true}
            data-tour="action-class"
            classCurr={data.classCurr}
            handleFilter={handleFilter}
          />
          <Button
            data-tour="action-submit"
            type="submit"
            variant="contained"
            color="success"
          >
            {slug && slug !== '__new' ? 'UPDATE' : 'SUBMIT'}
          </Button>
        </Box>
      </form>
      <Tutorial setRun={setTutorial} run={tutorial} steps={steps} />
      <Modal
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        open={dataTC !== null}
        onClose={() => setDataTC(null)}
      >
        <Box
          sx={{
            minWidth: '600px',
            maxWidth: '80vw',
            maxHeight: '90vh',
            backgroundColor: '#fff',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            bgcolor="#fff"
            component="h4"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
              alignItems: 'center',
              textAlign: 'center',
              py: 2,
              fontWeight: 'bold',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              bgcolor: '#ccc',
            }}
          >
            DATA TEST CASE DEMO ({dataTC?.length})
            <IconButton onClick={handleCopyTC}>
              <CopyAll />
            </IconButton>
          </Typography>
          <Box
            sx={{
              padding: '0 16px',
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <pre>
              {dataTC?.join('') ||
                'Data Empty Or Array Return All Empty String'}
            </pre>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default AdminProblem;
