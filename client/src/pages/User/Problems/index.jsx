import styles from "./Problems.module.css";
import { BugReport, Done } from "@mui/icons-material";
import {
    Box,
    CircularProgress,
    FormControl,
    MenuItem,
    Pagination,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleDatetime } from "~/utils/datetime";
import SearchDebounce from "~/components/SearchDebounce";
import useLoadingContext from "~/hook/useLoadingContext";
import DropdownClass from "~/components/DropdownClass";
import useAxiosAPI from "~/hook/useAxiosAPI";

export default function ProblemsPage() {
    const nav = useNavigate();
    const { axiosAPI, endpoints } = useAxiosAPI();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useLoadingContext();

    const [problems, setProblems] = useState([]);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [filter, setFiliter] = useState({
        limit:
            parseInt(searchParams.get("limit")) ||
            import.meta.env.VITE_PAGE_SIZE,
        page: parseInt(searchParams.get("page")) || 1,
        classCurr: searchParams.get("class") || "all",
        status: searchParams.get("status") || "all",
        time: searchParams.get("time") || "all",
    });

    const getProblems = async () => {
        if (loading) return;

        const params = new URLSearchParams();
        params.append("limit", filter.limit);
        params.append("page", filter.page);
        if (filter.classCurr.trim()) params.append("class", filter.classCurr);
        if (search.trim()) params.append("search", search);
        if (filter.status.trim()) params.append("status", filter.status);
        if (filter.time.trim()) params.append("time", filter.time);

        setLoading(true);
        await axiosAPI
            .get(endpoints.problems + "?" + params.toString())
            .then((res) => {
                const problemList = res.data?.data;
                setProblems(problemList);
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
            })
            .finally(() => setLoading(false));
    };

    const handleFilter = (value, type) => {
        setFiliter((prev) => {
            return {
                ...prev,
                [type]: value,
            };
        });

        setSearchParams((prev) => {
            prev.set(type, value);
            return prev;
        });
    };

    useEffect(() => {
        getProblems();
    }, [filter.classCurr, filter.status, filter.page, filter.time]);

    return (
        <Box
            sx={{
                padding: "12px 12px 12px 20px",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box>
                    {problems.length > 0 && (
                        <Pagination
                            count={filter.totalPage}
                            page={filter.page}
                            onChange={(_, value) => handleFilter(value, "page")}
                        />
                    )}
                </Box>

                <Box
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                    }}
                >
                    <SearchDebounce
                        search={search}
                        setSearch={setSearch}
                        fn={getProblems}
                    />

                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <DropdownClass
                            classCurr={filter.classCurr}
                            handleFilter={handleFilter}
                        />
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <Select
                            value={filter.status || "all"}
                            onChange={(e) =>
                                handleFilter(e.target.value, "status")
                            }
                        >
                            <MenuItem value="all">ALL</MenuItem>
                            <MenuItem value="true">SOLVED</MenuItem>
                            <MenuItem value="false">UNSOLVED</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <Select
                            value={filter.time || "all"}
                            onChange={(e) =>
                                handleFilter(e.target.value, "time")
                            }
                        >
                            <MenuItem value="all">ALL</MenuItem>
                            <MenuItem value="1">UPCOMING</MenuItem>
                            <MenuItem value="2">NOW</MenuItem>
                            <MenuItem value="3">FINISHED</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <TableContainer>
                <Table className={styles.table} sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell align="center">Class</TableCell>
                            <TableCell align="center">Start</TableCell>
                            <TableCell align="center">Time</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Solution</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    align="center"
                                    colSpan={6}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    <CircularProgress size={20} />
                                </TableCell>
                            </TableRow>
                        ) : problems?.length > 0 ? (
                            problems.map((row) => (
                                <TableRow
                                    key={row._id}
                                    onClick={() => nav("/problems/" + row.slug)}
                                    sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.title}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.class?.name}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.timeStart
                                            ? handleDatetime(row.timeStart)
                                            : "Available"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.testTime
                                            ? `${row.testTime} min`
                                            : "---"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.isSubmit ? (
                                            <Done color="success" />
                                        ) : (
                                            <BugReport color="warning" />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.status ? row.solution : "---"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    ---
                                </TableCell>
                                <TableCell align="center">---</TableCell>
                                <TableCell align="center">---</TableCell>
                                <TableCell align="center">---</TableCell>
                                <TableCell align="center">---</TableCell>
                                <TableCell align="center">---</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
