import { Autocomplete, TextField } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import useAxiosAPI from '~/hook/useAxiosAPI';

function AutocompleteProblems({ handeProblemChange }) {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [problems, setProblems] = useState([]);

  const getProblems = async () => {
    const res = await axiosAPI.get(
      endpoints.problems + '/get-problems-of-lecturer'
    );
    setProblems(res.data.data);
  };

  useEffect(() => {
    getProblems();
  }, []);

  return (
    <Autocomplete
      size="small"
      options={problems}
      sx={{ minWidth: 300 }}
      renderInput={(params) => <TextField {...params} label="Problem" />}
      getOptionLabel={(option) => option.title}
      onChange={(e, value) => handeProblemChange(value)}
    />
  );
}

export default AutocompleteProblems;
