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
  Fab,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import SearchDebounce from "~/components/SearchDebounce";
import useConfirmDialog from "~/hook/useConfirmDialog";
import useAxiosAPI from "~/hook/useAxiosAPI";
import { DialogContent, Modal, ModalDialog } from "@mui/joy";

export default function Classes() {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [searchParams, setSearchParams] = useSearchParams();
  const [confirm, ConfirmDialog] = useConfirmDialog();

  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [newClass, setNewClass] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filter, setFiliter] = useState({
    limit: parseInt(searchParams.get("limit")) || 8,
    page: parseInt(searchParams.get("page")) || 1,
  });

  const getData = async () => {
    const params = new URLSearchParams();
    params.append("limit", filter.limit);
    params.append("page", filter.page);
    if (search.trim()) params.append("search", search);

    await axiosAPI
      .get(endpoints.classes + "?" + params.toString())
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

  const handleFilter = (value, type) => {
    if (type === "page") {
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

  const handleCreateClass = async () => {
    if (!newClass.trim()) {
      toast.error("Class name is required");
      return;
    }

    await axiosAPI
      .post(endpoints.classes, {
        name: newClass,
      })
      .then((res) => {
        toast.success("Create class successfully");
        setModal(false);
        setNewClass("");
        setData((prev) => [...prev, res.data.data]);
      })
      .catch((err) => {
        err.response.status === 409 && toast.error(err.response.data.message);
      });
  };

  const handleDeleteClass = async (id) => {
    const cf = await confirm(
      "Delete Class",
      "This action cannot Ctrl + Z! Are you sure to delete this class? Users and Problems will be NULL class if you delete this!"
    );

    if (cf) {
      await axiosAPI
        .delete(endpoints.classes + "/" + id)
        .then(() => {
          toast.success("Delete class successfully");
          setData((prev) => prev.filter((item) => item._id !== id));
        })
        .catch((err) => {
          err.response.status === 409 && toast.error(err.response.data.message);
        });
    }
  };

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set("page", filter.page);
      return prev;
    });
    getData();
  }, [filter.page]);

  return (
    <>
      <Box
        sx={{
          padding: "12px 12px 12px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Pagination
            count={filter.totalPage}
            page={filter.page}
            onChange={(_, value) => handleFilter(value, "page")}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Fab onClick={() => setModal(true)} color="primary" size="small">
              +
            </Fab>
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
              borderRadius: "4px",
              background: "#fff",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Created At</TableCell>
                <TableCell align="center">Updated At</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.length > 0 ? (
                data.map((row) => (
                  <TableRow
                    key={row._id}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row._id || "---"}
                    </TableCell>
                    <TableCell align="center">{row.name || "---"}</TableCell>
                    <TableCell align="center">
                      {row.createdAt || "---"}
                    </TableCell>
                    <TableCell align="center">
                      {row.updatedAt || "---"}
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleDeleteClass(row._id)}
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
      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          setNewClass("");
        }}
      >
        <ModalDialog
          style={{
            padding: "12px",
          }}
        >
          <DialogContent>
            <Box
              sx={{
                display: "flex",
              }}
            >
              <TextField
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                fullWidth
                placeholder="Class name here ..."
                size="small"
              />
            </Box>
          </DialogContent>

          <Button onClick={handleCreateClass} autoFocus>
            Create
          </Button>
        </ModalDialog>
      </Modal>
    </>
  );
}
