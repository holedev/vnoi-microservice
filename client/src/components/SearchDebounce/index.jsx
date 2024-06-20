import { FormControl, TextField } from "@mui/material";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

function SearchDebounce({ search, setSearch, fn, time = 500, ...props }) {
  const timeoutRef = useRef(null);
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fn();
    }, time);
  }, [search]);

  useEffect(() => {
    setSearchParams((searchParams) => {
      searchParams.set("search", search);
      return searchParams;
    });
  }, [search]);

  return (
    <FormControl
      sx={{
        m: 1,
        display: "flex",
        alignItems: "center"
      }}
      size='small'
    >
      <TextField
        value={search || ""}
        onChange={(e) => setSearch(e.target.value)}
        size='small'
        id='outlined-search'
        label='Title'
        type='search'
        {...props}
      />
    </FormControl>
  );
}

export default SearchDebounce;
