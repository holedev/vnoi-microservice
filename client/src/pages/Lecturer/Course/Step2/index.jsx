import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
  Typography,
  styled,
} from '@mui/material';
import QuillEditor from '~/components/QuillEditor';
import GridOrderring from './GridOrdering';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';
import useAxiosAPI from '~/hook/useAxiosAPI';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useEffect } from 'react';
import { useRef } from 'react';
import ChildModal from './ChildModal';
import Question from './Question';
import ImportProblem from './ImportProblem';
import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/plyr/theme.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
  PlyrLayout,
  plyrLayoutIcons,
} from '@vidstack/react/player/layouts/plyr';
import { toast } from 'react-toastify';
import { useDebouncedCallback } from 'use-debounce';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const _DEBOUNCE_TIME = 5000;

function Step2({
  course: { _id, sections, lessons, activeSection, activeLesson, lessonData },
  setCourse,
}) {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const videoRef = useRef(null);

  const [loadProgress, setLoadProgress] = useState({
    video: false, // cannot get upload processing percentage with axios
    files: null,
  });
  const [videoEdit, setVideoEdit] = useState({
    isOpen: false,
    data: null,
    timeCurr: 0.0,
    interactives: [],
  });
  const [radio, setRadio] = useState('question');
  const [childModal, setChildModal] = useState(false);
  const [question, setQuestion] = useState({});
  const [problem, setProblem] = useState({});

  const handleUploadVideo = async (event) => {
    if (event.target.files.length > 1) {
      toast.error('Please select only one video');
      return;
    }

    if (loadProgress.video) {
      return;
    }

    setLoadProgress((prev) => {
      return {
        ...prev,
        video: true,
      };
    });

    const file = event.target.files[0];
    if (file) {
      const form = new FormData();
      form.append('video', file);

      await axiosAPI({
        method: 'POST',
        url: endpoints.media + '/videos',
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then((response) => {
          const { title, path, _id } = response.data.data;

          setCourse((prev) => {
            return {
              ...prev,
              lessonData: {
                ...prev.lessonData,
                video: { title, path, _id },
              },
            };
          });

          toast.success('Video uploaded successfully');
        })
        .catch((err) => toast.error(err.message))
        .finally(() => {
          setLoadProgress((prev) => {
            return {
              ...prev,
              video: false,
            };
          });
        });
    }
  };

  const handleUploadFiles = (event) => {
    const files = event.target.files;
    if (files) {
      const form = new FormData();
      for (let i = 0; i < files.length; i++) {
        form.append('file', files[i]);
      }

      axiosAPI({
        method: 'POST',
        url: endpoints.media + '/files',
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then((response) => {
          const files = response.data.data;

          setCourse((prev) => {
            return {
              ...prev,
              lessonData: {
                ...prev.lessonData,
                files: files,
              },
            };
          });
        })
        .catch((err) => console.log(err));
    }
  };

  const orderSections = useDebouncedCallback(async (sections) => {
    const data = sections.map((section) => {
      return {
        _id: section._id,
      };
    });

    await axiosAPI
      .patch(endpoints.learning + '/courses/order-sections/' + _id, {
        sections: data,
      })
      .catch((err) => toast.error(err.message));
  }, _DEBOUNCE_TIME);

  const handleDoubleClickSection = async (id, value) => {
    await axiosAPI
      .patch(endpoints.learning + '/courses/sections/' + id, {
        title: value,
      })
      .then((res) => {
        const { _id, title } = res.data.data;
        const newSections = sections.map((section) => {
          if (section._id === _id) {
            return {
              ...section,
              title,
            };
          }
          return section;
        });

        setCourse((prev) => {
          return {
            ...prev,
            sections: newSections,
          };
        });
      })
      .catch((err) => console.log(err));
  };

  const handleAddSection = async () => {
    await axiosAPI
      .post(endpoints.learning + '/courses/sections', {
        courseId: _id,
      })
      .then((res) => {
        const { _id, title } = res.data.data;

        setCourse((prev) => {
          return {
            ...prev,
            sections: [...prev.sections, { _id, title }],
          };
        });
      })
      .catch((err) => console.log(err));
  };

  const handleOnClickSection = async (id) => {
    setCourse((prev) => {
      return {
        ...prev,
        activeSection: id,
        activeLesson: null,
      };
    });

    await axiosAPI
      .get(endpoints.learning + '/courses/sections/' + id)
      .then((res) => {
        const { lessons } = res.data.data;
        setCourse((prev) => {
          return {
            ...prev,
            lessons,
          };
        });
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteSection = async (id) => {
    setCourse((prev) => {
      return {
        ...prev,
        sections: prev.sections.filter((section) => section._id !== id),
      };
    });

    await axiosAPI
      .patch(
        endpoints.learning + '/courses/sections/delete-section-of-course',
        {
          courseId: _id,
          sectionId: id,
        }
      )
      .catch((err) => toast.error(err.message));
  };

  const handleDeleteLesson = async (id) => {
    setCourse((prev) => {
      return {
        ...prev,
        lessons: prev.lessons.filter((lesson) => lesson._id !== id),
      };
    });

    await axiosAPI
      .patch(
        endpoints.learning + '/courses/lessons/delete-lesson-of-section',
        { sectionId: activeSection, lessonId: id }
      )
      .catch((err) => toast.error(err.message));
  };

  const orderLessons = useDebouncedCallback(async (lessons) => {
    const data = lessons.map((lesson) => {
      return {
        _id: lesson._id,
      };
    });

    await axiosAPI
      .patch(endpoints.learning + '/courses/order-lessons/' + activeSection, {
        lessons: data,
      })
      .catch((err) => toast.error(err.message));
  }, _DEBOUNCE_TIME);

  const handleDoubleClickLesson = async (id, value) => {
    await axiosAPI
      .patch(endpoints.learning + '/courses/lessons/' + id, {
        title: value,
      })
      .then((res) => {
        const { _id, title } = res.data.data;
        const newLessons = lessons.map((lesson) => {
          if (lesson._id === _id) {
            return {
              ...lesson,
              title,
            };
          }
          return lesson;
        });

        setCourse((prev) => {
          return {
            ...prev,
            lessons: newLessons,
          };
        });
      })
      .catch((err) => console.log(err));
  };

  const handleOnClickLesson = async (id) => {
    setCourse((prev) => {
      return {
        ...prev,
        activeLesson: id,
      };
    });
  };

  const handleAddLesson = async () => {
    await axiosAPI
      .post(endpoints.learning + '/courses/lessons', {
        sectionId: activeSection,
      })
      .then((res) => {
        const { _id, title } = res.data.data;

        setCourse((prev) => {
          return {
            ...prev,
            lessons: [...prev.lessons, { _id, title }],
          };
        });
      })
      .catch((err) => console.log(err));
  };

  const getVideo = async (id) => {
    const response = await axiosAPI
      .get(endpoints.media + '/videos/' + id)
      .catch((err) => console.log(err.message));
    return response.data.data;
  };

  const handleEditVideo = async (id) => {
    const video = await getVideo(id);
    setVideoEdit((prev) => {
      return {
        ...prev,
        data: video,
        isOpen: true,
        interactives: video.interactives,
      };
    });
  };

  const handleGetCurrentTime = () => {
    setVideoEdit((prev) => {
      return { ...prev, timeCurr: videoRef.current?.currentTime };
    });
  };

  const handleRadioChange = (event) => {
    setRadio(event.target.value);
  };

  const handleCreateQuestion = async () => {
    await axiosAPI({
      method: 'POST',
      url: endpoints.learning + '/courses/questions',
      data: question,
    })
      .then((res) => {
        const data = res.data.data;
        setVideoEdit((prev) => {
          return {
            ...prev,
            interactives: [
              ...prev.interactives,
              {
                type: 'question',
                time: videoEdit.timeCurr,
                _id: data._id,
              },
            ],
          };
        });

        setChildModal(false);
      })
      .catch((err) => console.log(err));
  };

  const handleAddInteractiveProblem = () => {
    if (!problem._id) return;

    setVideoEdit((prev) => {
      return {
        ...prev,
        interactives: [
          ...prev.interactives,
          {
            type: 'problem',
            time: videoEdit.timeCurr,
            _id: problem._id,
            slug: problem.slug,
          },
        ],
      };
    });

    setChildModal(false);
  };

  const handleAddInteractive = () => {
    setChildModal(true);
  };

  const handleUpdateVideo = async () => {
    await axiosAPI({
      method: 'PATCH',
      url: endpoints.media + '/videos/update-interactive/' + videoEdit.data._id,
      data: {
        interactives: videoEdit.interactives,
      },
    })
      .then((res) => {
        const data = res.data.data;
        console.log(data);
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteVideo = async (id) => {
    await axiosAPI
      .patch(endpoints.media + '/videos/delete-by-lecturer/' + id)
      .then((res) => {
        const { isDeleted } = res.data.data;

        if (!isDeleted) return toast.error('Cannot delete video!');

        if (isDeleted) {
          setCourse((prev) => {
            return {
              ...prev,
              lessonData: {
                ...prev.lessonData,
                video: null,
              },
            };
          });
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (!activeLesson) return;
    const getLessonData = async () =>
      await axiosAPI
        .get(endpoints.learning + '/courses/lessons/' + activeLesson)
        .then((res) => {
          const { video, files, content } = res.data.data;

          setCourse((prev) => {
            return {
              ...prev,
              lessonData: {
                video,
                files,
                content,
              },
            };
          });
        })
        .catch((err) => console.log(err));

    getLessonData();
  }, [activeLesson]);

  useEffect(() => {
    setVideoEdit((prev) => {
      return { ...prev, timeCurr: videoRef.current?.currentTime };
    });
  }, [videoRef.current?.currentTime]);

  return (
    <Box sx={{ minWidth: 500, width: '100%' }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 1 }}>
        Create Content
      </Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 14px',
              }}
            >
              <Typography variant="h6">Sections</Typography>
              <Button
                variant="outlined"
                onClick={handleAddSection}
                size="small"
              >
                +
              </Button>
            </Box>
            <Box>
              <GridOrderring
                type="sections"
                data={sections}
                setCourse={setCourse}
                itemOnClick={handleOnClickSection}
                itemOnDoubleClick={handleDoubleClickSection}
                orderUpdate={orderSections}
                handleDeleteItem={handleDeleteSection}
              />
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 14px',
              }}
            >
              <Typography variant="h6">Lessons</Typography>
              <Button onClick={handleAddLesson} size="small">
                +
              </Button>
            </Box>
            <Box>
              <GridOrderring
                type="lessons"
                data={lessons}
                setCourse={setCourse}
                itemOnClick={handleOnClickLesson}
                itemOnDoubleClick={handleDoubleClickLesson}
                orderUpdate={orderLessons}
                handleDeleteItem={handleDeleteLesson}
              />
            </Box>
          </Box>
        </Box>
        {activeLesson && (
          <Box sx={{ flex: 1 }}>
            <Box>
              <Breadcrumbs aria-label="breadcrumb">
                <Typography color="text">
                  {sections.find((s) => s._id == activeSection)?.title}
                </Typography>
                <Typography color="text.primary">
                  {lessons.find((s) => s._id == activeLesson)?.title}
                </Typography>
              </Breadcrumbs>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">Video</Typography>
              {!lessonData?.video?._id && (
                <Button
                  sx={{ mt: 1 }}
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  disabled={loadProgress.video ? true : false}
                >
                  Upload Video{' '}
                  {loadProgress.video && (
                    <CircularProgress
                      sx={{ ml: 1 }}
                      color="secondary"
                      size={25}
                    />
                  )}
                  <VisuallyHiddenInput
                    type="file"
                    accept=".mp4"
                    onChange={handleUploadVideo}
                  />
                </Button>
              )}
              {lessonData?.video?._id && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="">{lessonData?.video.title}</Typography>
                  <Button onClick={() => handleEditVideo(lessonData.video._id)}>
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteVideo(lessonData.video._id)}
                    size="small"
                    color="error"
                    variant="outlined"
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">Files</Typography>
                <Button
                  sx={{ mt: 1 }}
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Files
                  <VisuallyHiddenInput
                    onChange={handleUploadFiles}
                    multiple
                    type="file"
                    accept=".pdf, .doc"
                  />
                </Button>
              </Box>
              {lessonData?.files?.length > 0 && (
                <Box>
                  {lessonData.files.map((file) => {
                    return (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center' }}
                        key={file._id}
                      >
                        <InsertDriveFileIcon fontSize="large" />
                        <a href={file?.path} target="_blank" rel="noreferrer">
                          {file?.title}
                        </a>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Content</Typography>
              <Box sx={{ flex: 1 }}>
                <QuillEditor
                  value={lessonData?.content}
                  setValue={(value) =>
                    setCourse((prev) => {
                      return {
                        ...prev,
                        lessonData: {
                          ...prev.lessonData,
                          content: value,
                        },
                      };
                    })
                  }
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <Modal
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        open={videoEdit.isOpen}
        onClose={() =>
          setVideoEdit((prev) => {
            return { ...prev, isOpen: false };
          })
        }
      >
        <Box sx={{ maxWidth: 800, background: '#ccc', borderRadius: 2 }}>
          <Typography
            component="h4"
            sx={{
              textAlign: 'center',
              py: 2,
              fontWeight: 'bold',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
            }}
          >
            EDIT VIDEO: {videoEdit.data?.title}
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ flex: 1 }}>
              <MediaPlayer
                ref={videoRef}
                title="Sprite Fight"
                src={videoEdit.data?.path}
                onTimeUpdate={handleGetCurrentTime}
              >
                <MediaProvider />
                <PlyrLayout
                  thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
                  icons={plyrLayoutIcons}
                />
              </MediaPlayer>
            </Box>
            <Box
              sx={{
                minWidth: 300,
                padding: '0 6px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <FormControl>
                <RadioGroup
                  aria-labelledby="interactive"
                  defaultValue="question"
                  name="radio-buttons-group"
                  onChange={handleRadioChange}
                  value={radio}
                >
                  <FormControlLabel
                    value="question"
                    control={<Radio />}
                    label="Create Question"
                  />
                  <FormControlLabel
                    value="problem"
                    control={<Radio />}
                    label="Import Problem"
                  />
                </RadioGroup>
                <Button
                  sx={{ width: '100%' }}
                  variant="contained"
                  color="primary"
                  onClick={handleAddInteractive}
                >
                  Add interactive at {videoEdit.timeCurr?.toFixed(2) || '0.00'}
                </Button>
              </FormControl>
              <ChildModal open={childModal} setOpen={setChildModal}>
                {radio == 'question' && (
                  <Question
                    question={question}
                    setQuestion={setQuestion}
                    handleCreateQuestion={handleCreateQuestion}
                  />
                )}

                {radio == 'problem' && (
                  <ImportProblem
                    problem={problem}
                    setProblem={setProblem}
                    handleAddInteractiveProblem={handleAddInteractiveProblem}
                  />
                )}
              </ChildModal>
              {videoEdit.interactives.length > 0 && (
                <Box>
                  <Box>
                    {videoEdit.interactives.map((item) => (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                        key={item._id}
                      >
                        <Typography>
                          {parseFloat(item.time).toFixed(2)}
                        </Typography>
                        <Typography>{item.type}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
          <Button onClick={handleUpdateVideo} sx={{ m: 2 }} variant="outlined">
            Update Video
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default Step2;
