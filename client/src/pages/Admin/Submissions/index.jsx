import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Pagination,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import SearchDebounce from '~/components/SearchDebounce';
import useConfirmDialog from '~/hook/useConfirmDialog';
import useAxiosAPI from '~/hook/useAxiosAPI';
import { handleDatetime } from '~/utils/datetime';

export default function Problems() {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [searchParams, setSearchParams] = useSearchParams();
  const [confirm, ConfirmDialog] = useConfirmDialog();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState({
    limit: parseInt(searchParams.get('limit')) || 8,
    page: parseInt(searchParams.get('page')) || 1,
  });

  const getData = async () => {
    const params = new URLSearchParams();
    params.append('limit', filter.limit);
    params.append('page', filter.page);
    if (search.trim()) params.append('search', search);

    await axiosAPI
      .get(endpoints.submissions + '/get-by-admin?' + params.toString())
      .then((res) => {
        setData(res.data.data);
        setFilter((prev) => {
          const currentPage =
            res.data.currentPage > res.data.totalPage
              ? 1
              : res.data.currentPage;

          return {
            ...prev,
            page: currentPage,
            totalPage: res.data.totalPage,
          };
        });
      });
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete!',
      "This action can't Ctrl Z? Problem will be HARD delete! Are you sure?"
    );

    if (isConfirmed) {
      await axiosAPI.delete(endpoints.submissions + `/${id}`).then((res) => {
        if (res.status === 204) {
          setData((prev) => {
            return prev.filter((item) => item._id !== id);
          });
          toast.success('Update Success!');
        }
      });
    }
  };

  const handleDeleteSubmissionsWithoutAuthorOrProblem = async () => {
    const res = await axiosAPI.get(
      endpoints.submissions + '/get-submissions-without-author-without-problem'
    );
    const cf = await confirm(
      'Delete!',
      `This action can't Ctrl Z? Database will be delete document with NULL author and NULL problem, delete submissions & submissions folder of them! Find ${res.data.data.count}/${res.data.data.total}, continue?`
    );
    if (res.data?.data?.count == 0 && cf) {
      toast.warning('No submissions to delete!');
      return;
    }

    if (cf) {
      const cf2 = await confirm(
        'Delete!',
        "This action can't Ctrl Z? Submissions & Folders will be delete forever! Are you sure?"
      );
      if (cf2)
        await axiosAPI
          .delete(
            endpoints.submissions +
              '/delete-submissions-without-author-without-problem'
          )
          .then((res) => {
            res.status === 200 &&
              toast.success(
                `Delete ${res.data?.length} submissions successfully!`
              );
          });
    }
  };

  const handleFilter = (value, type) => {
    if (type === 'page') {
      setFilter((prev) => {
        return {
          ...prev,
          [type]: value,
        };
      });
    }

    setSearchParams((prev) => {
      prev.set(type, value);
      return prev;
    });
  };

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set('page', filter.page);
      return prev;
    });
    getData();
  }, [filter.page]);

  return (
    <Box
      sx={{
        padding: '12px 12px 12px 20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <Pagination
          count={filter.totalPage}
          page={filter.page}
          onChange={(_, value) => handleFilter(value, 'page')}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={handleDeleteSubmissionsWithoutAuthorOrProblem}
            title="Delete submissions without author or problem"
          >
            !!! Delete WITHOUT AUTHOR OR PROBLEM
          </Button>
          <SearchDebounce
            search={search}
            setSearch={setSearch}
            fn={getData}
            label="ID"
          />
        </Box>
      </div>
      <TableContainer>
        <Table
          sx={{
            minWidth: 650,
            borderRadius: '4px',
            background: '#fff',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="center">Author</TableCell>
              <TableCell align="center">Problem</TableCell>
              <TableCell align="center">Request Time</TableCell>
              <TableCell align="center">Pass</TableCell>
              <TableCell align="center">Score</TableCell>
              <TableCell align="center">Time</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{
                    '&:last-child td, &:last-child th': {
                      border: 0,
                    },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {row._id || '---'}
                  </TableCell>
                  <TableCell align="center">
                    {row.author?._id || '---'}
                  </TableCell>
                  <TableCell align="center">{row.problem || '---'}</TableCell>
                  <TableCell align="center">
                    {handleDatetime(row.requestReceivedAt, true) || '---'}
                  </TableCell>
                  <TableCell align="center">{row.pass || '---'}</TableCell>
                  <TableCell align="center">{row.score || '---'}</TableCell>
                  <TableCell align="center">{row.time || '---'}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDelete(row._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {ConfirmDialog}
    </Box>
  );
}
