import styles from "./Problems.module.css";
import { BugReport, CloudDownload, Done, Source } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleDatetime } from "~/utils/datetime";
import useLoadingContext from "~/hook/useLoadingContext";
import useAxiosAPI from "~/hook/useAxiosAPI";
import { downloadExcel } from "~/utils/xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { loadingToast } from "~/utils/toast";
import { toast } from "react-toastify";
import useUserContext from "~/hook/useUserContext";
import { getLevelString } from "~/utils/problem";

export default function Competition() {
  const nav = useNavigate();
  const [user] = useUserContext();
  const { axiosAPI, endpoints } = useAxiosAPI();

  const [loading, setLoading] = useLoadingContext();

  const [problems, setProblems] = useState([]);
  const [result, setResult] = useState(null);

  const getProblems = async () => {
    if (loading) return;

    setLoading(true);
    await axiosAPI
      .get(endpoints.problems + "/get-competition")
      .then((res) => {
        const problemList = res.data?.data;
        setProblems(problemList);
      })
      .finally(() => setLoading(false));
  };

  const getRank = async () => {
    const toastID = loadingToast("Get Ranking ...");
    await axiosAPI
      .get(endpoints.problems + "/get-rank-competition")
      .then((res) => {
        setResult(res.data.data);
      })
      .finally(() => toast.dismiss(toastID));
  };

  const handleDownloadExcel = () => {
    const headers = ["Student Code", "Full Name"];
    result.head.forEach((h) => {
      headers.push(h, "", "");
    });
    headers.push("Total", "Rank");

    const subheaders = ["", ""];
    result.head.forEach(() => {
      subheaders.push("Score", "Time Submit", "Total Submit");
    });
    subheaders.push("", "");

    const data = [headers, subheaders];

    result.body.forEach((b, idx) => {
      const row = [`${b.user.email.slice(0, 10)}`, `${b.user.fullName}`];
      result.head.forEach((h) => {
        row.push(
          b.data[h]?.score || b.data[h]?.score === 0 ? b.data[h]?.score : "---",
          handleDatetime(b.data[h]?.requestReceivedAt, true) || "---",
          b.data[h]?.submitTotal || "---"
        );
      });
      row.push(b.totalScore, idx + 1);
      data.push(row);
    });

    const mergeArr = [];
    for (let i = 0; i < result.head.length; i++) {
      const startCol = 2 + i * 3;
      mergeArr.push({
        s: { r: 0, c: startCol },
        e: { r: 0, c: startCol + 2 }
      });
    }
    mergeArr.push(
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      {
        s: { r: 0, c: result.head.length * 3 + 2 },
        e: { r: 1, c: result.head.length * 3 + 2 }
      },
      {
        s: { r: 0, c: result.head.length * 3 + 3 },
        e: { r: 1, c: result.head.length * 3 + 3 }
      }
    );

    downloadExcel("Olympic.xlsx", "RANKING", data, mergeArr);
  };

  const handleDownloadSource = async () => {
    const zip = new JSZip();

    result.body.forEach((b) => {
      result.head.forEach((h) => {
        if (b.data[h]?.solution)
          zip.folder(`${b.user.email.slice(0, 10)} - ${b.user.fullName}`).file(`${h}.cpp`, b.data[h]?.solution);
      });
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "olympic.zip");
  };

  const handleNavProblem = (slug, start) => {
    if (start && user.role === "STUDENT") {
      const now = new Date();
      if (now < new Date(start)) {
        toast.error("This problem is not available yet!");
        return;
      }
    }
    nav("/problems/" + slug);
  };

  useEffect(() => {
    getProblems();
  }, []);

  return (
    <Box
      sx={{
        padding: "12px 12px 12px 20px"
      }}
    >
      <Box
        sx={{
          mb: 1,
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        <Button onClick={() => getRank()} startIcon={<BarChartIcon />}>
          Rank
        </Button>
      </Box>
      <TableContainer>
        <Table className={styles.table} sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell align='center'>Class</TableCell>
              <TableCell align='center'>Level</TableCell>
              <TableCell align='center'>Start</TableCell>
              <TableCell align='center'>Time</TableCell>
              <TableCell align='center'>Status</TableCell>
              <TableCell align='center'>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell align='center' colSpan={6} sx={{ fontWeight: "bold" }}>
                  <CircularProgress size={20} />
                </TableCell>
              </TableRow>
            ) : problems.length > 0 ? (
              problems.map((row) => (
                <TableRow
                  key={row._id}
                  onClick={() => handleNavProblem(row.slug, row?.timeStart)}
                  sx={{
                    "&:last-child td, &:last-child th": {
                      border: 0
                    },
                    "&:hover": {
                      cursor: "pointer"
                    }
                  }}
                >
                  <TableCell component='th' scope='row'>
                    {row.title}
                  </TableCell>
                  <TableCell align='center'>{row.class?.name}</TableCell>
                  <TableCell align='center'>{getLevelString(row.level)}</TableCell>
                  <TableCell align='center'>{row.timeStart ? handleDatetime(row.timeStart) : "Available"}</TableCell>
                  <TableCell align='center'>{row.testTime ? `${row.testTime} min` : "---"}</TableCell>
                  <TableCell align='center'>
                    {row.isSubmit ? <Done color='success' /> : <BugReport color='warning' />}
                  </TableCell>
                  <TableCell align='center'>{row.score ? row.score : "---"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell component='th' scope='row'>
                  ---
                </TableCell>
                <TableCell align='center'>---</TableCell>
                <TableCell align='center'>---</TableCell>
                <TableCell align='center'>---</TableCell>
                <TableCell align='center'>---</TableCell>
                <TableCell align='center'>---</TableCell>
                <TableCell align='center'>---</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        open={result !== null}
        onClose={() => setResult(null)}
      >
        <div>
          <Typography
            bgcolor='#fff'
            component='h4'
            sx={{
              display: "flex",
              padding: "16px",
              alignItems: "center",
              textAlign: "center",
              py: 2,
              fontWeight: "bold",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              bgcolor: "#ccc"
            }}
          >
            Ranking
            {user.role !== "STUDENT" && (
              <>
                <IconButton onClick={() => handleDownloadExcel()} sx={{ ml: "auto" }} title='Download Result (Excel)'>
                  <CloudDownload />
                </IconButton>
                <IconButton onClick={() => handleDownloadSource()} sx={{ ml: 1 }} title='Download Solution (Folder)'>
                  <Source />
                </IconButton>
              </>
            )}
          </Typography>
          <TableContainer
            sx={{
              maxHeight: "80vh",
              maxWidth: "80vw",
              overflowY: "auto",
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0
            }}
            component={Paper}
          >
            <Table sx={{ minWidth: 500 }} aria-label='simple table'>
              <TableHead>
                <TableRow
                  sx={{
                    fontWeight: "bold"
                  }}
                >
                  <TableCell>No.</TableCell>
                  <TableCell align='center'>User</TableCell>
                  {result?.head?.map((h, idx) => {
                    return (
                      <TableCell key={idx} align='center'>
                        {h.trim()}
                      </TableCell>
                    );
                  })}
                  <TableCell sx={{ fontWeight: "bold" }} align='center'>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result && result.body?.length > 0 ? (
                  result.body.map((b, idx) => {
                    return (
                      <TableRow
                        key={idx}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0
                          }
                        }}
                      >
                        <TableCell component='th' scope='row'>
                          {idx + 1}
                        </TableCell>
                        <TableCell align='center'>
                          {b.user.email} - {b.user.fullName}
                        </TableCell>
                        {result.head.map((h, idx) => (
                          <TableCell
                            key={idx}
                            align='center'
                            title={b.data[h] ? handleDatetime(b.data[h].requestReceivedAt, true) : null}
                          >
                            {b.data[h]?.score || b.data[h]?.score === 0
                              ? b.data[h]?.score + ` (${b.data[h]?.submitTotal})`
                              : "---"}
                          </TableCell>
                        ))}
                        <TableCell sx={{ fontWeight: "bold" }} align='center'>
                          {b.totalScore}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell align='center' colSpan={5}>
                      No submit yet!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Modal>
    </Box>
  );
}
