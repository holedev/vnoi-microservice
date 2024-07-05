import { Box, Button, TextField, Typography } from "@mui/material";

function Question({ question, setQuestion, handleCreateQuestion }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography sx={{ textAlign: "center", mb: 1 }} variant='h5'>
        New Question
      </Typography>
      <TextField
        value={question.title}
        onChange={(e) => setQuestion({ ...question, title: e.target.value })}
        size='small'
        sx={{ width: "100%", mt: 1 }}
        label='Question'
      />

      <Typography sx={{ mt: 2 }} variant='h6'>
        Answers
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
        <TextField
          value={question.answer1}
          size='small'
          label='Answer 1 (Correct Answer)'
          onChange={(e) => setQuestion({ ...question, answer1: e.target.value })}
        />
        <TextField
          onChange={(e) => setQuestion({ ...question, answer2: e.target.value })}
          value={question.answer2}
          size='small'
          label='Answer 2'
        />
        <TextField
          onChange={(e) => setQuestion({ ...question, answer3: e.target.value })}
          value={question.answer3}
          size='small'
          label='Answer 3'
        />
        <TextField
          onChange={(e) => setQuestion({ ...question, answer4: e.target.value })}
          value={question.answer4}
          size='small'
          label='Answer 4'
        />
      </Box>

      <Button onClick={handleCreateQuestion} sx={{ mt: 2 }} variant='outlined' color='info'>
        Create
      </Button>
    </Box>
  );
}

export default Question;
