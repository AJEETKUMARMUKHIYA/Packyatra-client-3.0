import React from "react";
import { Stepper, Step, StepLabel, Box } from "@mui/material";

const steps = [
  "Select Items & Services",
  "Review & Payment"
];

const BookingProgress = ({ currentStep }) => {
  // MUI Stepper is 0-indexed, currentStep is 1-indexed (1 to 5)
  const activeStep = currentStep - 1;

  return (
    <Box sx={{ width: "100%", mb: 4, mt: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default BookingProgress;
