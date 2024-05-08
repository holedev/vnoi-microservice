import { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import useUserContext from '~/hook/useUserContext';
import useAxiosAPI from '~/hook/useAxiosAPI';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

const steps = ['Course Information', 'Create Content', 'Publish'];

export default function Course() {
  const [user] = useUserContext();

  const { id } = useParams();

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
  });
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  const getCourse = async (id) => {
    await axiosAPI({
      method: 'GET',
      url: endpoints.learning + `/courses/${id}`,
    })
      .then((response) => {
        const { _id, title, desc, coverPath, authors, sections } =
          response.data.data;
        setCourse({
          _id,
          title,
          desc,
          coverPath,
          authors,
          sections,
        });
      })
      .catch((err) => console.log(err));
  };

  const isStepOptional = () => {
    return false;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);

    if (activeStep == 0) {
      const isNewCourse = !course._id;
      if (isNewCourse) {
        createCourse();
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
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
      .then((response) => {
        console.log(response.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (id) getCourse(id);
  }, [id]);

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
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              padding: '24px 0',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {activeStep === 0 && (
              <Step1 course={course} setCourse={setCourse} />
            )}
            {activeStep === 1 && (
              <Step2 course={course} setCourse={setCourse} />
            )}
            {activeStep === 2 && <Step3 />}
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
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}

            {activeStep === 1 && (
              <Button onClick={handleSaveDraft} variant="outlined">
                Save a draft
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
