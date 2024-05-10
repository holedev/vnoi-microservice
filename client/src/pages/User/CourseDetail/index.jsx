import {
  AppBar,
  Box,
  CardMedia,
  Collapse,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Modal,
  Typography,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import useAxiosAPI from '~/hook/useAxiosAPI';
import Question from './Question';

function CourseDetail() {
  const { id } = useParams();
  const { axiosAPI, endpoints } = useAxiosAPI();
  const videoRef = useRef(null);

  const [course, setCourse] = useState({});
  const [lesson, setLesson] = useState({});
  const [openSidebar, setOpenSidebar] = useState(false);
  const [questionModal, setQuestionModal] = useState(null);

  const getCourse = async () => {
    await axiosAPI({
      url: endpoints.learning + '/courses/' + id,
      method: 'GET',
    })
      .then((res) => {
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
        setLesson(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const handleClickSection = (id) => {
    setOpenSidebar((prev) => {
      return {
        ...prev,
        [id]: !prev[id],
      };
    });
  };

  const handleClickLesson = (id) => {
    getLesson(id);
  };

  const handleTimeUpdate = () => {
    if (!lesson.video?.interactives || lesson.video.interactives.length === 0)
      return;

    const currTime = videoRef.current?.currentTime;

    lesson.video.interactives?.forEach((item) => {
      if (!item.isPass && currTime >= item.time) {
        videoRef.current.pause();
        setQuestionModal(item._id);
      }
    });
  };

  const handleAnswered = (_id) => {
    setLesson((prev) => {
      return {
        ...prev,
        video: {
          ...prev.video,
          interactives: prev.video.interactives.map((item) => {
            if (item._id == _id) {
              return { ...item, isPass: true };
            }
            return item;
          }),
        },
      };
    });
  };

  const handleCloseModal = () => {
    setQuestionModal(null);
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
              <CardMedia
                ref={videoRef}
                component="video"
                image={lesson.video.path}
                controls
                onTimeUpdate={handleTimeUpdate}
              />
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
                  `0${idxSection + 1}`.slice(-2) +
                  `. ${section.title} (${section.lessons?.length || 0})`;

                return (
                  <Box key={section._id}>
                    <ListItemButton
                      onClick={() => handleClickSection(section._id)}
                      sx={{ background: '#bbb' }}
                    >
                      <ListItemText primary={title} />
                      {openSidebar[section._id] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </ListItemButton>
                    {section.lessons &&
                      section.lessons.length > 0 &&
                      section.lessons.map((lesson) => {
                        const title = `${lesson.title}`;

                        return (
                          <Collapse
                            in={openSidebar[section._id]}
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
      <Modal open={questionModal} onClose={handleCloseModal}>
        <Question id={questionModal} handleAnswered={handleAnswered} />
      </Modal>
    </Box>
  );
}

export default CourseDetail;
