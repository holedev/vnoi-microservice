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
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchDebounce from '~/components/SearchDebounce';
import useConfirmDialog from '~/hook/useConfirmDialog';
import useAxiosAPI from '~/hook/useAxiosAPI';

export default function Problems() {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [searchParams, setSearchParams] = useSearchParams();
  const [confirm, ConfirmDialog] = useConfirmDialog();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFiliter] = useState({
    limit: parseInt(searchParams.get('limit')) || 8,
    page: parseInt(searchParams.get('page')) || 1,
  });

  const getData = async () => {
    const params = new URLSearchParams();
    params.append('limit', filter.limit);
    params.append('page', filter.page);
    if (search.trim()) params.append('search', search);

    await axiosAPI
      .get(endpoints.problems + '/get-by-admin?' + params.toString())
      .then((res) => {
        setData(res.data.data);
        setFiliter((prev) => {
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

  const handleDetails = async (id) => {
    console.log(id);
  };

  const handleDelete = async (slug, isDeleted) => {
    let isConfirmed;
    if (!isDeleted) {
      isConfirmed = await confirm(
        'Delete!',
        "This action can't Ctrl Z? Problem will be soft delete. After 30 days, problem will be delete forever! Are you sure?"
      );
    } else isConfirmed = true;
    if (isConfirmed) {
      await axiosAPI.patch(endpoints.problems + `/${slug}`).then((res) => {
        if (res.status === 200) {
          setData((prev) => {
            prev = prev.map((p) => {
              if (p.slug === slug) p.isDeleted = res.data.data;
              return p;
            });
            return prev;
          });
          toast.success('Update Success!');
        }
      });
    }
  };

  const handleFilter = (value, type) => {
    if (type === 'page') {
      setFiliter((prev) => {
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

  const handleDeleteProblemWithoutAuthor = async () => {
    const res = await axiosAPI.get(
      endpoints.problems + '/get-problems-without-author'
    );
    const cf = await confirm(
      'Delete!',
      `This action can't Ctrl Z? Database will be delete document with NULL author and delete problems & submissions folder of this problem! Find ${res.data.data.count}/${res.data.data.total}, continue?`
    );
    if (res.data?.data?.count == 0 && cf) {
      toast.warning('No folder to delete!');
      return;
    }

    if (cf) {
      const cf2 = await confirm(
        'Delete!',
        "This action can't Ctrl Z? Folder will be delete forever! Are you sure?"
      );
      if (cf2)
        await axiosAPI
          .delete(endpoints.problems + '/delete-problem-without-author')
          .then((res) => {
            res.status === 200 &&
              toast.success(`Delete ${res.data?.length} problem Successfully!`);
          });
    }
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
      <Box
        sx={{
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
            onClick={handleDeleteProblemWithoutAuthor}
            title="Delete problems without author"
          >
            !!! Delete WITHOUT AUTHOR
          </Button>
          <SearchDebounce
            search={search}
            setSearch={setSearch}
            fn={getData}
            label="ID"
          />
        </Box>
      </Box>
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
              <TableCell align="center">UUID</TableCell>
              <TableCell align="center">Title</TableCell>
              <TableCell align="center">Slug</TableCell>
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
                  <TableCell align="center">{row.uuid || '---'}</TableCell>
                  <TableCell align="center">{row.title || '---'}</TableCell>
                  <TableCell align="center">{row.slug || '---'}</TableCell>
                  <TableCell align="center">
                    <Stack justifyContent="center" direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleDetails(row._id)}
                      >
                        DETAILS
                      </Button>
                      <Button
                        size="small"
                        color={row.isDeleted ? 'info' : 'error'}
                        variant="outlined"
                        onClick={() => handleDelete(row.slug, row.isDeleted)}
                      >
                        {row?.isDeleted ? 'Restore' : 'Delete'}
                      </Button>
                    </Stack>
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
