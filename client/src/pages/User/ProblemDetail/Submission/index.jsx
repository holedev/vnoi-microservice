import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { handleDatetime } from '~/utils/datetime';
import useAxiosAPI from '~/hook/useAxiosAPI';
import { getBgSubmitByScore } from './handle';
import useLoadingContext from '~/hook/useLoadingContext';
import { CircularProgress, LinearProgress } from '@mui/material';

function Submission({
  problem,
  user,
  submissions,
  setSubmissions,
  setCode,
  isLoad,
}) {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [loading, setLoading] = useLoadingContext();

  const getSubmissions = async () => {
    if (!problem) return;

    setLoading(true);
    const data = {
      problem,
      user,
    };
    await axiosAPI
      .post(endpoints.submissions + '/get-by-user', data)
      .then((res) => {
        const data = res.data.data;
        setSubmissions(data);
      })
      .catch((err) =>
        toast.error(err.response.data.message || 'Get submissions fail!')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getSubmissions();
  }, []);

  return (
    <TableContainer
      sx={{
        flex: 1,
        display: 'flex',
        height: 'fit-content',
        maxHeight: '100%',
        overflowY: 'auto',
      }}
      component={Paper}
    >
      <Table
        sx={{
          minWidth: 300,
          position: 'relative',
        }}
      >
        <TableHead
          sx={{
            position: 'sticky',
            top: 0,
            background: '#ccc',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <TableRow>
            <TableCell align="center">
              <b>Created At</b>
            </TableCell>
            <TableCell align="center">
              <b>Pass</b>
            </TableCell>
            <TableCell align="center">
              <b>Score</b>
            </TableCell>
            <TableCell align="center">
              <b>Time Avg</b>
            </TableCell>
            <TableCell align="center">
              <b>Memory Avg</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoad.submit && (
            <TableRow bgcolor="">
              <TableCell sx={{ p: 3 }} align="center" colSpan={5}>
                <LinearProgress />
              </TableCell>
            </TableRow>
          )}
          {loading ? (
            <TableRow>
              <TableCell align="center" colSpan={5}>
                <CircularProgress size={20} />
              </TableCell>
            </TableRow>
          ) : submissions.length > 0 ? (
            submissions.map((row) => (
              <TableRow
                bgcolor={getBgSubmitByScore(row.score)}
                onClick={() =>
                  setCode({
                    langIdSolution: row.langIdSolution,
                    text: row.solution,
                  })
                }
                key={row.uuid}
                style={{
                  maxHeight: '50px !important',
                }}
                sx={{
                  '&:last-child td, &:last-child th': {
                    border: 0,
                  },
                  '&:hover': {
                    cursor: 'pointer',
                  },
                }}
              >
                <TableCell align="center" component="th" scope="row">
                  {handleDatetime(row?.requestReceivedAt, true)}
                </TableCell>
                <TableCell align="center">{row.pass}</TableCell>
                <TableCell align="center">{row.score}</TableCell>
                <TableCell align="center">{row.timeAvg}s</TableCell>
                <TableCell align="center">{row.memoryAvg}kb</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell align="center" colSpan={5}>
                No submit yet!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Submission;
