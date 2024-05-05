import { Box, Divider, Stack, Typography } from '@mui/material';
import CourseCard from '~/components/CourseCard';

function Course() {
  return (
    <Box
      sx={{
        padding: '12px 12px 12px 20px',
      }}
    >
      <Divider>
        <Typography variant="h5">Course Available</Typography>
      </Divider>
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
        }}
      >
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
      </Box>
    </Box>
  );
}

export default Course;
