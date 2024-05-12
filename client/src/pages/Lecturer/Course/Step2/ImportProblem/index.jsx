import { Box, Button, Typography } from '@mui/material';
import AutocompleteProblems from '../AutocompleteProblems';
import useAxiosAPI from '~/hook/useAxiosAPI';
import DetailTestCase from '~/components/DetailTestCase';

function ImportProblem({ problem, setProblem, handleAddInteractiveProblem }) {
  const { axiosAPI, endpoints } = useAxiosAPI();

  const handeProblemChange = async (value) => {
    if (!value?._id) return;
    await axiosAPI({
      method: 'GET',
      url: endpoints.problems + '/get-by-id/' + value._id,
    })
      .then((res) => {
        const data = res.data.data;
        setProblem(data);
      })
      .catch((err) => console.log(err));
  };

  return (
    <Box>
      <Typography sx={{ mb: 2 }} variant="h6">
        Import Problem
      </Typography>
      <AutocompleteProblems handeProblemChange={handeProblemChange} />

      {problem._id && (
        <>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Preview</Typography>
            <DetailTestCase problem={problem} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              onClick={handleAddInteractiveProblem}
              sx={{ width: '100%' }}
              variant="outlined"
              color="info"
            >
              Add Interactive
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default ImportProblem;
