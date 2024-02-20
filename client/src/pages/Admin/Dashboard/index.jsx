import styles from "./Dashboard.module.css";
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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import SearchDebounce from "~/components/SearchDebounce";
import useConfirmDialog from "~/hook/useConfirmDialog";
import useAxiosAPI from "~/hook/useAxiosAPI";
import Edit from "./Edit";

export default function Dashboard() {
    const { axiosAPI, endpoints } = useAxiosAPI();
    const [searchParams, setSearchParams] = useSearchParams();
    const [confirm, ConfirmDialog] = useConfirmDialog();

    const [data, setData] = useState([]);
    const [classList, setClassList] = useState([]);
    const [dataU, setDataU] = useState(null);
    const [edit, setEdit] = useState(false);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [filter, setFiliter] = useState({
        limit: parseInt(searchParams.get("limit")) || 3,
        page: parseInt(searchParams.get("page")) || 1,
    });

    const getClassList = async () => {
        await axiosAPI.get(`${endpoints.classes}`).then((res) => {
            const classList = res.data?.data;
            setClassList(classList);
        });
    };

    const getData = async () => {
        const params = new URLSearchParams();
        params.append("limit", filter.limit);
        params.append("page", filter.page);
        if (search.trim()) params.append("search", search);

        await axiosAPI
            .get(endpoints.users + "?" + params.toString())
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

    const handleDelete = async (_id) => {
        const isConfirmed = await confirm(
            "Delete!",
            "This action can't Ctrl Z?"
        );
        if (isConfirmed) {
            await axiosAPI.delete(endpoints.users + `/${_id}`).then((res) => {
                if (res.status === 204) {
                    setData((prev) => {
                        prev = prev.filter((u) => u._id !== _id);
                        return prev;
                    });
                    toast.success("Delete Success!");
                }
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

    useEffect(() => {
        getClassList();
    }, []);

    useEffect(() => {
        if (dataU) setEdit(true);
    }, [dataU]);

    return (
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

                <SearchDebounce
                    search={search}
                    setSearch={setSearch}
                    fn={getData}
                    label="ID, Email"
                />
            </div>
            <TableContainer>
                <Table
                    className={styles.table}
                    sx={{ minWidth: 650 }}
                    aria-label="simple table"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell align="center">Role</TableCell>
                            <TableCell align="center">Full Name</TableCell>
                            <TableCell align="center">Class</TableCell>
                            <TableCell align="center">Email</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.length > 0 ? (
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
                                        {row.studentCode || "---"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.role || "---"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.fullName || "---"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.classCurr?.name || "---"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.email || "---"}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            onClick={() => {
                                                setDataU(row);
                                                setEdit(true);
                                            }}
                                            size="small"
                                            variant="contained"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            sx={{
                                                marginLeft: "6px",
                                            }}
                                            onClick={() =>
                                                handleDelete(row._id)
                                            }
                                            size="small"
                                            color="error"
                                            variant="outlined"
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
            {dataU && (
                <Edit
                    setListUser={setData}
                    user={dataU}
                    setUser={setDataU}
                    edit={edit}
                    setEdit={setEdit}
                    classList={classList}
                />
            )}
        </Box>
    );
}
