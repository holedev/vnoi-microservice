import { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import useUserContext from '~/hook/useUserContext';
import useAxiosAPI from '~/hook/useAxiosAPI';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Step4 from './Step4';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const steps = ['Course Information', 'Create Content', 'Review', 'Publish'];

export default function Course() {
  const [user] = useUserContext();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const nav = useNavigate();

  const { axiosAPI, endpoints } = useAxiosAPI();
  const [course, setCourse] = useState({
    _id: null,
    title: '',
    desc: '',
    authors: [
      {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isMe: true,
      },
    ],
    coverPath: '',
    sections: [],
    lessons: [],
    activeSection: null,
    activeLesson: null,
    lessonData: {
      video: {},
      files: [],
      content: null,
    },
    publish: {
      classes: [],
      time: null,
    },
  });
  const [activeStep, setActiveStep] = useState(() => {
    if (searchParams.get('step')) {
      return parseInt(searchParams.get('step')) - 1;
    }
    return 0;
  });
  const [skipped, setSkipped] = useState(new Set());

  const getCourse = async (id) => {
    await axiosAPI({
      method: 'GET',
      url: endpoints.learning + `/courses/get-course-by-lecturer/${id}`,
    })
      .then((response) => {
        const { _id, title, desc, coverPath, authors, sections, publish } =
          response.data.data;
        setCourse({
          _id,
          title,
          desc,
          coverPath,
          authors,
          sections,
          publish,
        });
      })
      .catch((err) => console.log(err));
  };

  const handleNext = async () => {
    let newSkipped = skipped;

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);

    if (activeStep == 0) {
      const isNewCourse = !course._id;

      if (isNewCourse) {
        createCourse();
        return;
      }

      updateCourseInfo();
    }

    if (activeStep == 3) {
      await handlePublic(course._id, {
        classes: course.publish.classes,
        time: new Date(),
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePublic = async (_id, publishData) => {
    await axiosAPI({
      method: 'PATCH',
      url: endpoints.learning + `/courses/publish/${_id}`,
      data: publishData,
    })
      .then((response) => {
        nav('/lecturer/dashboard/courses');
        toast.success('Publish course successfully');
      })
      .catch((err) => console.log(err));
  };

  const createCourse = async () => {
    await axiosAPI({
      method: 'POST',
      url: endpoints.learning + '/courses',
      data: course,
    })
      .then((response) => {
        const { _id, title, desc, coverPath, authors, sections } =
          response.data.data;

        setCourse((prev) => {
          return {
            ...prev,
            _id,
            title,
            desc,
            coverPath,
            authors,
            sections,
          };
        });
      })
      .catch((err) => console.log(err));
  };

  const updateCourseInfo = async () => {
    await axiosAPI({
      method: 'PATCH',
      url: endpoints.learning + `/courses/update-info/${course._id}`,
      data: course,
    }).catch((err) => console.log(err));
  };

  const handleSaveDraft = async () => {
    const lessonId = course.activeLesson;

    if (!lessonId) {
      return;
    }

    await axiosAPI({
      method: 'PATCH',
      url: endpoints.learning + `/courses/save-draft/${lessonId}`,
      data: course.lessonData,
    })
      .then(() => {
        toast.success('Save draft successfully');
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  useEffect(() => {
    if (id) getCourse(id);
  }, [id]);

  useEffect(() => {
    setSearchParams({ step: activeStep + 1 });
  }, [activeStep]);

  return (
    <Box
      sx={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Stepper activeStep={activeStep}>
        {steps.map((label) => {
          const stepProps = {};
          const labelProps = {};

          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box
        sx={{
          padding: '24px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {activeStep === 0 && <Step1 course={course} setCourse={setCourse} />}
        {activeStep === 1 && <Step2 course={course} setCourse={setCourse} />}
        {activeStep === 2 && <Step3 courseId={course._id} />}
        {activeStep === 3 && <Step4 course={course} setCourse={setCourse} />}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          pt: 2,
          marginTop: 'auto',
        }}
      >
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />

        {activeStep === 1 && (
          <Button onClick={handleSaveDraft} variant="outlined">
            Save a draft
          </Button>
        )}
        <Button onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Publish' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
