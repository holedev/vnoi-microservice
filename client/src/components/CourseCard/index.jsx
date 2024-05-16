import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { handleDatetime } from '~/utils/datetime';

function CourseCard({ course }) {

  const nav = useNavigate()

  const handleStatistic = () => {
    const { sections, lessons, videos, files } = course.statistic;
    return `${sections.total} section, ${lessons.total} lesson, ${videos.total} video, ${files.total} file`;
  };

  const handleNav = (id) => { 
    nav(`/courses/${id}`)
  }

  return (
    <Card
      onClick={() => handleNav(course._id)}
      sx={{ width: 340 }}
    >
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          sx={{ objectFit: 'cover' }}
          image={course.coverPath}
          alt="Cover Image"
        />
        <CardContent>
          <Typography
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '1',
              WebkitBoxOrient: 'vertical',
              height: '32px',
            }}
            gutterBottom
            variant="h5"
            component="div"
          >
            {course.title}
          </Typography>
          <Typography
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              height: '40px',
            }}
            variant="body2"
            color="text.primary"
          >
            {course.desc}
          </Typography>
          <Typography
            sx={{ mt: 2, textAlign: 'center' }}
            variant="body2"
            color="text.secondary"
          >
            {handleStatistic()}
          </Typography>
          <Typography
            sx={{ textAlign: 'center' }}
            variant="body2"
            color="text.secondary"
          >
            Last update: {handleDatetime(course.updatedAt)}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: '4px',
              mt: 1,
              justifyContent: 'center',
            }}
          >
            {course.authors.map((author) => (
              <Chip key={author.email} label={author.fullName} />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CourseCard;
