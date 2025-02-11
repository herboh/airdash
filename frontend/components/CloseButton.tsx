import React from "react";
import { Box, colors } from "@airtable/blocks/ui";

interface CloseButtonProps {
  onClose: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClose }) => {
  return (
    <Box
      position="absolute"
      top="50px"
      right="20px"
      fontSize="16px"
      fontWeight="bold"
      onClick={onClose}
      style={{
        textDecoration: "none",
        transition: "color 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
    >
      Clear [X]
    </Box>
  );
};
export default CloseButton;
