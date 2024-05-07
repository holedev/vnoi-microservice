import { Box, Button, Typography, styled } from '@mui/material';
import QuillEditor from '~/components/QuillEditor';
import GridOrderring from './GridOrdering';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';
import useAxiosAPI from '~/hook/useAxiosAPI';

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

  const handleVideo = async (event) => {
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

  const handleFilesChange = (event) => {
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

    await axiosAPI
      .get(endpoints.learning + '/courses/lessons/' + id)
      .then((res) => {
        const data = res.data.data;
        console.log(data);
      })
      .catch((err) => console.log(err));
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 4,
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
                  disabled={loadProgress.video}
                >
                  Upload Video{' '}
                  {loadProgress.video && `(${loadProgress.video}%)`}
                  <VisuallyHiddenInput
                    type="file"
                    accept=".mp4"
                    onChange={handleVideo}
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
                  <Button
                    onClick={() => {
                      window.open(
                        `localhost:9004/${lessonData?.video.path}`,
                        '_blank'
                      );
                    }}
                  >
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
                    onChange={handleFilesChange}
                    multiple
                    type="file"
                    accept=".pdf, .doc"
                  />
                </Button>
              </Box>
              {lessonData?.files.length > 0 && (
                <Box>
                  {lessonData.files.map((file) => {
                    return (
                      <Box key={file._id}>
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
                <QuillEditor />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Step2;
