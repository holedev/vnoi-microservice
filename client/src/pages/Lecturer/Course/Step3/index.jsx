import { Box, CardMedia, Chip, Typography } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import useAxiosAPI from "~/hook/useAxiosAPI";

function Step3({ courseId }) {
  const { axiosAPI, endpoints } = useAxiosAPI();
  const [reviewCourse, setReviewCourse] = useState({});

  const getReviewCourse = async (id) => {
    await axiosAPI({
      method: "GET",
      url: endpoints.learning + `/courses/review/${id}`
    })
      .then((response) => {
        const data = response.data.data;
        setReviewCourse(data);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleStatistic = () => {
    const { sections, lessons, videos, files } = reviewCourse.statistic;
    return `${sections.total} section, ${lessons.total} lesson, ${videos.total} video, ${files.total} file`;
  };

  useEffect(() => {
    if (courseId) {
      getReviewCourse(courseId);
      return;
    }
  }, [courseId]);

  return (
    <Box sx={{ minWidth: 500 }}>
      <Typography variant='h5' sx={{ textAlign: "center", mb: 1 }}>
        Review
      </Typography>

      {reviewCourse?._id && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              border: "1px solid #ccc",
              padding: "4px",
              borderRadius: "4px"
            }}
          >
            <Box sx={{ maxWidth: 400, display: "flex" }}>
              <CardMedia component='img' image={reviewCourse?.coverPath} alt='Cover Preview' />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant='h6'>{reviewCourse?.title}</Typography>
              <Typography variant='body2'>{reviewCourse?.desc}</Typography>

              <Box
                sx={{
                  mt: "auto",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "center"
                }}
              >
                {reviewCourse?.authors?.map((author) => (
                  <Chip label={author.fullName} key={author._id} />
                ))}
              </Box>
              {reviewCourse?.statistic && (
                <Typography sx={{ mt: "2px" }} variant='overline'>
                  {handleStatistic()}
                </Typography>
              )}
            </Box>
          </Box>

          {reviewCourse?.sections && (
            <SimpleTreeView>
              {reviewCourse.sections.map((section) => (
                <TreeItem itemId={section._id} label={section.title} key={section._id}>
                  {section.lessons.map((lesson) => {
                    const videoQuantity = lesson?.video ? 1 : 0;
                    const fileQuantity = lesson?.files?.length || 0;

                    const label = `${lesson.title} (${videoQuantity} video, ${fileQuantity} file)`;

                    return <TreeItem itemId={lesson._id} label={label} key={lesson._id}></TreeItem>;
                  })}
                </TreeItem>
              ))}
            </SimpleTreeView>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Step3;
