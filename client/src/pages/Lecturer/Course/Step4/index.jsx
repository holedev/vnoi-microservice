import { Box, Chip, Typography } from "@mui/material";
import DropdownClass from "~/components/DropdownClass";

function Step4({ course: { publish }, setCourse }) {
  // eslint-disable-next-line no-unused-vars
  const handleSelectClass = (value, key) => {
    const isExist = publish.classes.includes(value);
    if (isExist) return;

    if (publish.classes.includes("all")) {
      setCourse((prev) => {
        return {
          ...prev,
          publish: {
            ...prev.publish,
            classes: [value]
          }
        };
      });
      return;
    }

    if (value === "all") {
      setCourse((prev) => {
        return {
          ...prev,
          publish: {
            ...prev.publish,
            classes: ["all"]
          }
        };
      });
      return;
    }

    setCourse((prev) => {
      return {
        ...prev,
        publish: {
          ...prev.publish,
          classes: [...prev.publish.classes, value]
        }
      };
    });
  };

  return (
    <Box sx={{ minWidth: 500 }}>
      <Typography variant='h5' sx={{ textAlign: "center", mb: 1 }}>
        Publish
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Typography variant='body2'>Select class (ALL to public)</Typography>
        <DropdownClass classCurr={publish.classes[publish.classes.length - 1]} handleFilter={handleSelectClass} />
      </Box>
      <Box sx={{ display: "flex", mt: 1, gap: 1 }}>
        {publish.classes.map((item, idx) => {
          return <Chip label={item} key={idx} />;
        })}
      </Box>
    </Box>
  );
}

export default Step4;
