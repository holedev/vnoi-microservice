import {
  Box,
  FormGroup,
  Autocomplete,
  TextField,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { _AUTHOR_DATA } from './data';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

function Step1() {
  const [authors, setAuthors] = useState([]);
  const [banner, setBanner] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBanner(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ minWidth: 500 }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 1 }}>
        Course Information
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormGroup>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            Upload Cover Image
            <VisuallyHiddenInput
              type="file"
              accept=".png, .jpg"
              onChange={handleFileChange}
            />
          </Button>
        </FormGroup>
        {banner && (
          <FormGroup>
            <img
              src={banner}
              alt="Banner Preview"
              style={{ maxWidth: 500, marginTop: '10px' }}
            />
          </FormGroup>
        )}
        <FormGroup sx={{ mt: 2 }}>
          <TextField label="Title" size="small" />
        </FormGroup>
        <FormGroup>
          <TextField label="Description" size="small" />
        </FormGroup>
        <FormGroup>
          <Autocomplete
            size="small"
            options={_AUTHOR_DATA}
            sx={{ minWidth: 300 }}
            renderInput={(params) => (
              <TextField {...params} label="Author(s)" />
            )}
            getOptionLabel={(option) => option.value}
            onChange={(e, value) => {
              const isExist = authors.find((item) => item.id === value.id);
              if (isExist) return;
              setAuthors([...authors, value]);
            }}
          />
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              mt: 1,
            }}
          >
            {authors?.map((author) => (
              <Chip
                sx={{
                  userSelect: 'none',
                }}
                key={author.id}
                onDoubleClick={() => {
                  setAuthors(authors.filter((item) => item.id !== author.id));
                }}
                label={author.value}
              />
            ))}
          </Box>
        </FormGroup>
      </Box>
    </Box>
  );
}

export default Step1;
