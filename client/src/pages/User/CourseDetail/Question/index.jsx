import { Box, Button, Chip, Typography, Alert } from "@mui/material";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import useAxiosAPI from "~/hook/useAxiosAPI";
import { handleDatetime } from "~/utils/datetime";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 2,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column"
};

function Question({ id, videoId, handleAnswered, handleCloseModal }) {
  const { axiosAPI, endpoints } = useAxiosAPI();

  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);

  const getQuestion = async () => {
    const res = await axiosAPI.get(endpoints.learning + "/courses/questions/" + id);
    setQuestion(res.data.data);
  };

  const handleCheckAnswer = async (id) => {
    setResult(null);

    await axiosAPI
      .post(endpoints.learning + "/courses/questions/check-result", {
        questionId: question._id,
        answerId: id,
        videoId: videoId
      })
      .then((res) => {
        const data = res.data.data;
        setResult(data);
        handleAnswered(question._id);
      })
      .catch((err) => toast.error(err.message));
  };

  useEffect(() => {
    if (id) getQuestion();
  }, [id]);

  return (
    <Box sx={{ ...style }}>
      <Typography sx={{ textAlign: "center" }} variant='h6'>
        {question?.title}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          mt: 2
        }}
      >
        {question?.answers &&
          question?.answers?.map((answer, index) => (
            <Button
              sx={{ border: "1px solid #ccc", width: "45%" }}
              key={answer._id}
              onClick={() => handleCheckAnswer(answer._id)}
            >
              {index + 1}. {answer.value}
            </Button>
          ))}
      </Box>
      {result && (
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          {result.result ? <Chip label='Correct' color='success' /> : <Chip label='Incorrect' color='error' />} -
          Correct Answer: <Chip label={result?.correctAnswer.value} variant='outlined' color='info' />
        </Typography>
      )}
      {question?.isAnswered && (
        <Alert sx={{ mt: 2 }} severity='info'>
          You have select {question?.isAnswered.value} at {handleDatetime(question?.isAnswered.time, true)}
        </Alert>
      )}

      <Button
        onClick={handleCloseModal}
        color='error'
        variant='outlined'
        sx={{ width: "fit-content", margin: "20px auto 0" }}
      >
        Close
      </Button>
    </Box>
  );
}

export default Question;
