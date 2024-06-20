import {
  AppBar,
  Box,
  CardMedia,
  Checkbox,
  Collapse,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Modal,
  Typography,
  Alert
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

import useAxiosAPI from "~/hook/useAxiosAPI";
import Question from "./Question";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlyrLayout, plyrLayoutIcons } from "@vidstack/react/player/layouts/plyr";
import { toast } from "react-toastify";
import { handleUserSubmitProblem } from "~/utils/firebase";
import useUserContext from "~/hook/useUserContext";

const _LESSON_PROGRESS_DONE = 90;

function CourseDetail() {
  const { id } = useParams();
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [user] = useUserContext();
  const videoRef = useRef(null);

  const [course, setCourse] = useState({});
  const [lesson, setLesson] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [questionModal, setQuestionModal] = useState(null);
  const [problemQuestion, setProblemQuestion] = useState(null);

  const getCourse = async () => {
    await axiosAPI({
      url: endpoints.learning + "/courses/" + id,
      method: "GET"
    })
      .then((res) => {
        setCourse(res.data.data);
      })
      .catch((err) => toast.error(err.message));
  };

  const getLesson = async (id) => {
    await axiosAPI({
      url: endpoints.learning + "/courses/lessons/" + id,
      method: "GET"
    })
      .then((res) => {
        const data = res.data.data;
        setLesson(data);
        setActiveLesson(id);
      })
      .catch((err) => toast.error(err.message));
  };

  const handleClickSection = (id) => {
    setOpenSidebar((prev) => {
      return {
        ...prev,
        [id]: !prev[id]
      };
    });
  };

  const handleClickLesson = async (id) => {
    if (activeLesson == id) return;
    setActiveLesson(id);
  };

  const checkProgressVideo = (currentTime, duration) => {
    if (!currentTime || !duration) return;

    const progress = (currentTime / duration).toFixed(2) * 100;

    return progress >= _LESSON_PROGRESS_DONE;
  };

  const checkInteractivesVideo = (currentTime) => {
    if (!lesson.video?.interactives || lesson.video.interactives.length === 0) return;

    lesson.video.interactives?.forEach((item) => {
      if (!item.isAnswered && currentTime >= item.time) {
        videoRef.current.pause();
        item.type === "question" && setQuestionModal(item._id);
        item.type === "problem" && setProblemQuestion(item);
        return;
      }
    });
  };

  const handleLessonStatus = async (_id, status) => {
    setLesson((prev) => {
      return {
        ...prev,
        isDone: status
      };
    });

    setCourse((prev) => {
      return {
        ...prev,
        sections: prev.sections.map((section) => {
          return {
            ...section,
            lessons: section.lessons.map((lesson) => {
              if (lesson._id == _id) {
                return {
                  ...lesson,
                  isDone: status
                };
              }
              return lesson;
            })
          };
        })
      };
    });

    await axiosAPI({
      method: "PATCH",
      url: endpoints.learning + "/courses/lessons/update-user-done-list/" + _id,
      data: {
        courseId: course._id,
        status
      }
    }).catch((err) => toast.error(err.message));
  };

  const handleTimeUpdate = () => {
    const duration = videoRef.current.duration;
    const currTime = videoRef.current.currentTime;

    const isDoneLesson = !lesson.isDone && checkProgressVideo(currTime, duration);

    if (isDoneLesson) {
      handleLessonStatus(lesson._id, true);
    }

    checkInteractivesVideo(currTime);
  };

  const handleAnswered = (_id) => {
    setLesson((prev) => {
      return {
        ...prev,
        video: {
          ...prev.video,
          interactives: prev.video.interactives.map((item) => {
            if (item._id == _id) {
              return { ...item, isAnswered: true };
            }
            return item;
          })
        }
      };
    });
  };

  const handleLoadedMetadata = (interactives) => {
    if (!interactives || interactives.length === 0) return;

    const duration = videoRef.current.duration;
    const positions = interactives.map((i) => {
      return {
        time: i.time,
        isAnswered: i.isAnswered
      };
    });

    positions.forEach((pos) => {
      if (pos.time <= duration) {
        const left = (pos.time / duration) * 100 + "%";
        const marker = document.createElement("div");
        marker.style.position = "absolute";
        marker.style.left = left;
        marker.style.width = "5px";
        marker.style.height = "5px";
        marker.style.background = pos.isAnswered ? "green" : "red";
        document.querySelector(".plyr__slider__track").appendChild(marker);
      }
    });
  };

  const handleCloseModal = () => {
    setQuestionModal(null);
  };

  const handleDoneProblemOfVideo = ({ problemId }) => {
    if (!problemId) return;
    if (!lesson.video?.interactives || lesson.video?.interactives?.length === 0) return;

    const newInteractives = lesson.video.interactives.map((item) => {
      if (item._id == problemId) {
        return { ...item, isAnswered: true };
      }
      return item;
    });

    setLesson((prev) => {
      return {
        ...prev,
        video: {
          ...prev.video,
          interactives: newInteractives
        }
      };
    });

    handleLoadedMetadata(newInteractives);
    videoRef.current.play();
  };

  useEffect(() => {
    const sliderTrack = document.querySelector(".plyr__slider__track");
    if (sliderTrack) {
      sliderTrack.innerHTML = "";
    }
    if (activeLesson) getLesson(activeLesson);
  }, [activeLesson]);

  useEffect(() => {
    if (id) getCourse(id);
  }, [id]);

  useEffect(() => {
    if (problemQuestion?.slug) {
      window.open("http://localhost:5173/problems/" + problemQuestion.slug, "_blank");
    }
  }, [problemQuestion]);

  useEffect(() => {
    handleUserSubmitProblem(user._id, handleDoneProblemOfVideo);
  }, []);

  return (
    <Box>
      <AppBar
        sx={{
          display: "flex",
          alignItems: "center",
          height: 32
        }}
        position='static'
      >
        <Typography variant='h6'>{course.title}</Typography>
      </AppBar>
      <Box sx={{ height: "calc(100vh - 32px)", display: "flex" }}>
        {lesson?._id ? (
          <Box
            sx={{
              height: "100%",
              overflow: "auto",
              flex: 1
            }}
          >
            {lesson.video && (
              <Box>
                <MediaPlayer
                  ref={videoRef}
                  title='video'
                  src={lesson.video.path}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => handleLoadedMetadata(lesson.video?.interactives)}
                >
                  <MediaProvider />
                  <PlyrLayout icons={plyrLayoutIcons} />
                </MediaPlayer>
              </Box>
            )}
            <Box sx={{ p: 1 }}>
              <Typography sx={{ mt: 1 }} variant='h6'>
                Files ({lesson.files?.length || 0})
              </Typography>

              {lesson.files?.length == 0 && (
                <Alert sx={{ mt: 1 }} variant='outlined' severity='info'>
                  There is no file for this lesson!
                </Alert>
              )}

              {lesson.files && (
                <Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {lesson.files.map((file) => (
                      <Link key={file._id} href={file.path} download>
                        {file.title}
                      </Link>
                    ))}
                  </Box>
                </Box>
              )}
              <Typography sx={{ mt: 2 }} variant='h6'>
                Content
              </Typography>
              {!lesson.content?.trim() && (
                <Alert sx={{ mt: 1 }} variant='outlined' severity='info'>
                  There is no content for this lesson!
                </Alert>
              )}
              {lesson.content && <Box dangerouslySetInnerHTML={{ __html: lesson.content }}></Box>}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              height: "100%",
              overflow: "auto",
              flex: 1
            }}
          >
            <CardMedia component='img' image={course.coverPath} />
            <Typography sx={{ p: 1 }} variant='body2'>
              {course.desc}
            </Typography>
          </Box>
        )}

        <Box sx={{ minWidth: 350, borderLeft: "1px solid #ccc" }}>
          <List disablePadding>
            {course?.sections &&
              course.sections.map((section, idxSection) => {
                const title = `0${idxSection + 1}`.slice(-2) + `. ${section.title} (${section.lessons?.length || 0})`;

                return (
                  <Box key={section._id}>
                    <ListItemButton onClick={() => handleClickSection(section._id)} sx={{ background: "#bbb" }}>
                      <ListItemText primary={title} />
                      {openSidebar[section._id] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    {section.lessons &&
                      section.lessons.length > 0 &&
                      section.lessons.map((lesson) => {
                        const title = `${lesson.title}`;

                        return (
                          <Collapse
                            in={openSidebar[section._id] || false}
                            timeout='auto'
                            unmountOnExit
                            key={lesson._id}
                          >
                            <List component='div' disablePadding>
                              <ListItemButton
                                onClick={() => handleClickLesson(lesson._id)}
                                sx={{
                                  background: lesson._id === activeLesson ? "#ccc" : ""
                                }}
                              >
                                <ListItemText primary={title} />
                                <Checkbox
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLessonStatus(lesson._id, !lesson?.isDone || false);
                                  }}
                                  checked={lesson?.isDone}
                                />
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
      <Modal open={questionModal || false} onClose={handleCloseModal}>
        <Question
          id={questionModal}
          videoId={lesson.video?._id}
          handleCloseModal={handleCloseModal}
          handleAnswered={handleAnswered}
        />
      </Modal>
    </Box>
  );
}

export default CourseDetail;
