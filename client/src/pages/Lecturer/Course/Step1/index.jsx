import { Box, FormGroup, TextField, Button, Chip, Typography } from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useAxiosAPI from "~/hook/useAxiosAPI";
import LinearWithValueLabel from "~/components/LinearWithValueLabel";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1
});

function Step1({ course: { title, desc, coverPath, authors }, setCourse }) {
  const { axiosAPI, endpoints } = useAxiosAPI();

  const [loadProgress, setLoadProgress] = useState(null);

  const handleData = (value, key) => {
    setCourse((prev) => {
      return {
        ...prev,
        [key]: value
      };
    });
  };

  const handleAddAuthor = async (ev) => {
    if (ev.key === "Enter") {
      const email = ev.target.value;

      await axiosAPI
        .get(endpoints.users + `/findLecturerByEmail/${email}`)
        .then((response) => {
          const { _id, fullName, email } = response.data.data;

          const isExistAuthor = authors.some((author) => author._id === _id);
          if (isExistAuthor) return;

          setCourse((prev) => {
            return {
              ...prev,
              authors: [
                ...prev.authors,
                {
                  _id,
                  fullName,
                  email
                }
              ]
            };
          });
        })
        .catch((err) => console.log(err));
    }
  };

  const handleDeleteAuthor = (id) => {
    setCourse((prev) => {
      return {
        ...prev,
        authors: prev.authors.filter((item) => item._id !== id)
      };
    });
  };

  const handleDeleteCover = async () => {
    setCourse((prev) => {
      return {
        ...prev,
        coverPath: ""
      };
    });

    await axiosAPI({
      method: "DELETE",
      url: endpoints.media + "/images/" + coverPath.split("/images/")[1]
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const form = new FormData();
      form.append("image", file);

      await axiosAPI({
        method: "POST",
        url: endpoints.media + "/images",
        data: form,
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          setLoadProgress((progressEvent.loaded / progressEvent.total).toFixed(2) * 100);
        }
      })
        .then((response) => {
          setLoadProgress(null);
          const { path } = response.data.data;
          setCourse((prev) => {
            return {
              ...prev,
              coverPath: path
            };
          });
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <Box sx={{ minWidth: 500 }}>
      <Typography variant='h5' sx={{ textAlign: "center", mb: 1 }}>
        Course Information
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <FormGroup>
          {!coverPath && (
            <Button
              component='label'
              role={undefined}
              variant='contained'
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Upload Cover Image (16:9)
              <VisuallyHiddenInput type='file' accept='.png, .jpg' onChange={handleFileChange} />
            </Button>
          )}
        </FormGroup>
        {loadProgress && (
          <FormGroup>
            <LinearWithValueLabel progress={loadProgress} />
          </FormGroup>
        )}
        {coverPath && (
          <FormGroup>
            <img src={coverPath} alt='Banner Preview' style={{ maxWidth: 500, borderRadius: 8 }} />
          </FormGroup>
        )}
        {coverPath && (
          <Button
            sx={{ width: "fit-content", margin: "auto" }}
            variant='outlined'
            color='error'
            onClick={handleDeleteCover}
          >
            Delete Cover
          </Button>
        )}
        <FormGroup sx={{ mt: 2 }}>
          <TextField label='Title' value={title} onChange={(e) => handleData(e.target.value, "title")} size='small' />
        </FormGroup>
        <FormGroup>
          <TextField
            label='Description'
            value={desc}
            onChange={(e) => handleData(e.target.value, "desc")}
            size='small'
          />
        </FormGroup>
        <FormGroup>
          <Box sx={{ width: "100%" }}>
            <TextField
              onKeyDown={(ev) => handleAddAuthor(ev)}
              sx={{ width: "100%" }}
              label='Email author'
              size='small'
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              mt: 1
            }}
          >
            {authors?.map((author) => {
              let text = author.fullName;
              if (author.isMe) text += " (Me)";

              return (
                <Chip
                  sx={{
                    userSelect: "none"
                  }}
                  key={author._id}
                  label={text}
                  onDelete={author.isMe ? undefined : () => handleDeleteAuthor(author._id)}
                />
              );
            })}
          </Box>
        </FormGroup>
      </Box>
    </Box>
  );
}

export default Step1;
