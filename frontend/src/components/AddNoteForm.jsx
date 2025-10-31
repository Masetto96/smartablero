import { useState } from "react";
import { Button, Textarea, Group, Box } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { noteColors } from "./PostItNote";

const colors = ["yellow", "pink", "blue", "mint", "peach"];

const AddNoteForm = ({ onAddNote }) => {
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onAddNote(content.trim(), selectedColor);
      setContent("");
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        size="lg"
        leftSection={<IconPlus size={20} />}
        style={{
          boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.2)",
          fontFamily: "'Courier New', monospace",
          fontSize: "1.125rem",
        }}
      >
      </Button>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      style={{ width: "100%", maxWidth: "400px" }}
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note here..."
        minRows={5}
        maxLength={280}
        autoFocus
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "1.125rem",
        }}
        styles={{
          input: {
            resize: "none",
          },
        }}
      />
      
      <Group mt="md" gap="xs" align="center">
        <span style={{ 
          fontSize: "0.875rem", 
          fontFamily: "'Courier New', monospace",
          color: "#666",
        }}>
          Color:
        </span>
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setSelectedColor(color)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: noteColors[color],
              border: selectedColor === color 
                ? "4px solid #606c38" 
                : "2px solid #ccc",
              cursor: "pointer",
              transition: "all 0.2s ease",
              transform: selectedColor === color ? "scale(1.1)" : "scale(1)",
            }}
            aria-label={`Select ${color} color`}
          />
        ))}
      </Group>

      <Group mt="md" gap="sm">
        <Button
          type="submit"
          disabled={!content.trim()}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "1rem",
          }}
        >
          Post it!
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsExpanded(false);
            setContent("");
          }}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "1rem",
          }}
        >
          Cancel
        </Button>
      </Group>
    </Box>
  );
};

export default AddNoteForm;
