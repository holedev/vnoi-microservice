import {
  Box,
  Breadcrumbs,
  Button,
  CardMedia,
  Modal,
  TextField,
  Typography,
  styled,
  Autocomplete,
} from '@mui/material';
import QuillEditor from '~/components/QuillEditor';
import GridOrderring from './GridOrdering';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';
import useAxiosAPI from '~/hook/useAxiosAPI';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useEffect } from 'react';
import AutocompleteProblems from './AutocompleteProblems';

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

function Step2({
  course: { _id, sections, lessons, activeSection, activeLesson, lessonData },
  setCourse,
}) {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [loadProgress, setLoadProgress] = useState({
    video: null,
    files: null,
  });
  const [videoEdit, setVideoEdit] = useState({
    isOpen: false,
    data: null,
  });

  const handleUploadVideo = async (event) => {
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
        onUploadProgress: (progressEvent) => {
          setLoadProgress((prev) => {
            return {
              ...prev,
              video:
                (progressEvent.loaded / progressEvent.total).toFixed(2) * 100,
            };
          });
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

          setLoadProgress((prev) => {
            return {
              ...prev,
              video: null,
            };
          });
        })
        .catch((err) => console.log(err));
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

  const orderSections = async (sections) => {
    const data = sections.map((section) => {
      return {
        _id: section._id,
      };
    });

    await axiosAPI
      .patch(endpoints.learning + '/courses/order-sections/' + _id, {
        sections: data,
      })
      .then((res) => console.log(res.data.data))
      .catch((err) => console.log(err));
  };

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

  const orderLessons = async (lessons) => {
    const data = lessons.map((lesson) => {
      return {
        _id: lesson._id,
      };
    });

    await axiosAPI
      .patch(endpoints.learning + '/courses/order-lessons/' + activeSection, {
        lessons: data,
      })
      .then((res) => console.log(res.data.data))
      .catch((err) => console.log(err));
  };

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
    const response = await axiosAPI.get(endpoints.media + '/videos/' + id);
    return response.data.data;
  };

  const handleEditVideo = async (id) => {
    const video = await getVideo(id);
    setVideoEdit((prev) => {
      return {
        ...prev,
        data: video,
        isOpen: true,
      };
    });
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
              }}
            >
              <Typography variant="h6">Sections</Typography>
              <Button onClick={handleAddSection} size="small">
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
              />
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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
                  {loadProgress.video && `(${loadProgress.video}%)`}
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
                  <Button size="small" color="error" variant="outlined">
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
              <CardMedia
                component="video"
                className=".MuiCardMedia-media"
                image={videoEdit.data?.path}
                autoPlay
                controls
              />
            </Box>
            <Box sx={{ minWidth: 300, padding: '0 6px' }}>
              <Typography component="h6" sx={{ textAlign: 'center' }}>
                Import Problem
              </Typography>
              <AutocompleteProblems />
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default Step2;
