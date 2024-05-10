import {
  AppBar,
  Box,
  CardMedia,
  Collapse,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import useAxiosAPI from '~/hook/useAxiosAPI';

function CourseDetail() {
  const { id } = useParams();
  const { axiosAPI, endpoints } = useAxiosAPI();

  const [course, setCourse] = useState({});
  const [lesson, setLesson] = useState({});
  const [open, setOpen] = useState(false);

  const getCourse = async () => {
    await axiosAPI({
      url: endpoints.learning + '/courses/' + id,
      method: 'GET',
    })
      .then((res) => {
        console.log(res.data.data);
        setCourse(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const getLesson = async (id) => {
    await axiosAPI({
      url: endpoints.learning + '/courses/lessons/' + id,
      method: 'GET',
    })
      .then((res) => {
        console.log(res.data.data);
        setLesson(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const handleClickSection = (id) => {
    setOpen((prev) => {
      return {
        ...prev,
        [id]: !prev[id],
      };
    });
  };

  const handleClickLesson = (id) => {
    getLesson(id);
  };

  useEffect(() => {
    if (id) getCourse(id);
  }, [id]);

  return (
    <Box>
      <AppBar
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 32,
        }}
        position="static"
      >
        <Typography variant="h6">{course.title}</Typography>
      </AppBar>
      <Box sx={{ height: 'calc(100vh - 32px)', display: 'flex' }}>
        <Box
          sx={{
            height: '100%',
            overflow: 'auto',
            flex: 1,
          }}
        >
          {lesson.video && (
            <Box>
              <CardMedia component="video" image={lesson.video.path} controls />
            </Box>
          )}
          <Box sx={{ p: 1 }}>
            <Typography sx={{ mt: 1 }} variant="h6">
              Files ({lesson.files?.length || 0})
            </Typography>
            {lesson.files && (
              <Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {lesson.files.map((file) => (
                    <Link key={file._id} href={file.path} download>
                      {file.title}
                    </Link>
                  ))}
                </Box>
              </Box>
            )}
            <Typography sx={{ mt: 2 }} variant="h6">
              Content
            </Typography>
            {lesson.content && (
              <>
                <Box dangerouslySetInnerHTML={{ __html: lesson.content }}></Box>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ minWidth: 350 }}>
          <List disablePadding>
            {course?.sections &&
              course.sections.map((section, idxSection) => {
                const title =
                  `0${idxSection + 1}`.slice(-2) + `. ${section.title} (${section.lessons?.length || 0})`;

                return (
                  <Box key={section._id}>
                    <ListItemButton
                      onClick={() => handleClickSection(section._id)}
                      sx={{ background: '#bbb' }}
                    >
                      <ListItemText primary={title} />
                      {open[section._id] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    {section.lessons &&
                      section.lessons.length > 0 &&
                      section.lessons.map((lesson) => {
                        const title = `${lesson.title}`;

                        return (
                          <Collapse
                            in={open[section._id]}
                            timeout="auto"
                            unmountOnExit
                            key={lesson._id}
                          >
                            <List component="div" disablePadding>
                              <ListItemButton
                                onClick={() => handleClickLesson(lesson._id)}
                              >
                                <ListItemText primary={title} />
                              </ListItemButton>
                            </List>
                          </Collapse>
                        );
                      })}
                  </Box>
                );
              })}
          </List>
        </Box>
      </Box>
    </Box>
  );
}

export default CourseDetail;
