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

function Step2() {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [video, setVideo] = useState({
    uuid: null,
    path: null,
    title: null,
    loadProgress: null,
  });
  const [files, setFiles] = useState([]);

  const handleVideo = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const form = new FormData();
      form.append('video', file);

      await axiosAPI({
        method: 'POST',
        url: endpoints.videos,
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          setVideo((prev) => {
            return {
              ...prev,
              loadProgress:
                (progressEvent.loaded / progressEvent.total).toFixed(2) * 100,
            };
          });
        },
      })
        .then((response) => {
          const { title, path, uuid } = response.data.data;
          setVideo((prev) => {
            return {
              ...prev,
              uuid,
              path,
              title,
              loadProgress: null,
            };
          });
        })
        .catch((err) => console.log(err));
    }
  };

  const handleFilesChange = (event) => {
    const files = event.target.files;
    if (files) {
      const fileUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setFiles(fileUrls);
    }
  };

  return (
    <Box sx={{ minWidth: 500, width: '100%' }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 1 }}>
        Create Content
      </Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Video</Typography>
            {!video.uuid && (
              <Button
                sx={{ mt: 1 }}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                disabled={video.loadProgress}
              >
                Upload Video {video.loadProgress && `(${video.loadProgress}%)`}
                <VisuallyHiddenInput
                  type="file"
                  accept=".mp4"
                  onChange={handleVideo}
                />
              </Button>
            )}
            {video.uuid && (
              <Box>
                <Typography variant="body1">{video.title}</Typography>
                <Button
                  onClick={() => {
                    window.open(`localhost:9004/${video.path}`, '_blank');
                  }}
                >
                  Edit
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
                  accept=".pdf, .docx, .doc"
                />
              </Button>
            </Box>
            <Box>
              {files.map((file, index) => (
                <Box key={index}>
                  <a href={file} target="_blank" rel="noreferrer">
                    {file}
                  </a>
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Content</Typography>
            <Box sx={{ flex: 1 }}>
              <QuillEditor />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box>
            <Box>
              <Typography variant="h6">Lessons</Typography>
            </Box>
            <Box>
              <GridOrderring />
            </Box>
          </Box>

          <Box>
            <Box>
              <Typography variant="h6">Sections</Typography>
            </Box>
            <Box>
              <GridOrderring />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Step2;
