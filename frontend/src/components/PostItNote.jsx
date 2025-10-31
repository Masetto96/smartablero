import { useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export const noteColors = {
  yellow: "#fef08a",
  pink: "#fecdd3",
  blue: "#bfdbfe",
  mint: "#a7f3d0",
  peach: "#fed7aa",
};

const PostItNote = ({ id, content, color, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const rotation = Math.random() * 4 - 2; // Random rotation between -2 and 2 degrees

  return (
    <div
      style={{ 
        position: "relative",
        padding: "1.5rem",
        backgroundColor: noteColors[color],
        borderRadius: "4px",
        boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.1)",
        minHeight: "180px",
        transform: `rotate(${rotation}deg)`,
        transition: "all 0.3s ease",
        cursor: "pointer",
        ...(isHovered && {
          transform: `rotate(${rotation}deg) scale(1.05)`,
          boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.2)",
          zIndex: 10,
        }),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ActionIcon
        color="red"
        variant="filled"
        radius="xl"
        size="sm"
        style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "scale(1)" : "scale(0.75)",
          transition: "all 0.2s ease",
          zIndex: 10,
        }}
        onClick={() => onDelete(id)}
        aria-label="Delete note"
      >
        <IconX size={16} />
      </ActionIcon>
      
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: "1.25rem",
        lineHeight: "1.6",
        color: "#1a1a1a",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
      }}>
        {content}
      </div>
    </div>
  );
};

export default PostItNote;
