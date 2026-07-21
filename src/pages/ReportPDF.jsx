import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

const PageContainer = styled(Box)({
  backgroundColor: "#444",
  padding: "0 10px",
  minWidth: "fit-content",
});

const Page = styled(Box)({
  backgroundColor: "white",
  position: "relative",
  overflow: "hidden",
  margin: "10px auto",
  width: "fit-content",
});

const AnnotationsContainer = styled(Box)({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 3,
  pointerEvents: "none",
});

const TextElement = styled(Typography)(({ top, left, transform }) => ({
  position: "absolute",
  whiteSpace: "pre",
  overflow: "visible",
  lineHeight: "1.5",
  transformOrigin: "bottom left",
  transform: transform ? `scale(${transform})` : "none",
  top: top,
  left: left,
}));

const ReportPage = () => {
  return (
    <PageContainer>
      <Page>
        <AnnotationsContainer>
          <TextElement top="20px" left="50px" transform="1.5">
            Sample Report Title
          </TextElement>

          <TextElement top="60px" left="50px">
            Subtitle goes here with additional details.
          </TextElement>

          <TextElement top="100px" left="50px">
            Section 1: Information about the report.
          </TextElement>

          <TextElement top="140px" left="50px">
            Section 2: Another detail about the report.
          </TextElement>

          <TextElement top="180px" left="50px">
            Section 3: More structured content.
          </TextElement>
        </AnnotationsContainer>
      </Page>
    </PageContainer>
  );
};

export default ReportPage;
