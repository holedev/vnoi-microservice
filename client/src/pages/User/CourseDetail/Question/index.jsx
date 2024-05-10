import { Box, Button, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import useAxiosAPI from '~/hook/useAxiosAPI';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

function Question({ id, handleAnswered }) {
  const { axiosAPI, endpoints } = useAxiosAPI();

  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);

  const getQuestion = async () => {
    const res = await axiosAPI.get(
      endpoints.learning + '/courses/questions/' + id
    );
    setQuestion(res.data.data);
  };

  const handleCheckAnswer = async (id) => {
    setResult(null);

    await axiosAPI
      .post(endpoints.learning + '/courses/questions/check-result', {
        questionId: question._id,
        answerId: id,
      })
      .then((res) => {
        const data = res.data.data;
        setResult(data);
        handleAnswered(question._id);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (id) getQuestion();
  }, [id]);

  return (
    <Box sx={{ ...style }}>
      <Typography variant="h6">{question?.title}</Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
          mt: 2,
        }}
      >
        {question?.answers &&
          question?.answers?.map((answer, index) => (
            <Button
              sx={{ border: '1px solid #ccc', width: '45%' }}
              key={answer._id}
              onClick={() => handleCheckAnswer(answer._id)}
            >
              {index + 1}. {answer.value}
            </Button>
          ))}
      </Box>
      {result && (
        <Typography sx={{ mt: 2 }}>
          {result.result ? 'Correct' : 'Incorrect'} - Correct Answer:{' '}
          {result?.correctAnswer.value}
        </Typography>
      )}
    </Box>
  );
}

export default Question;
