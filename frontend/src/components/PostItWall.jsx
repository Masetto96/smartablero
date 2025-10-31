import { useState, useEffect } from "react";
import { Container, Title, Stack, Center } from "@mantine/core";
import PostItNote from "./PostItNote";
import AddNoteForm from "./AddNoteForm";

const PostItWall = () => {
  const [notes, setNotes] = useState([]);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("postItNotes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error("Failed to load notes:", error);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("postItNotes", JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = (content, color) => {
    const newNote = {
      id: Date.now().toString(),
      content,
      color,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <Container 
      fluid 
      style={{ 
        padding: "2rem",
        backgroundColor: "rgb(32, 31, 26)",
        minHeight: "100vh",
      }}
    >
      <Stack gap="xl" align="center">
        {/* <Title
          order={1}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "3rem",
            color: "#b6ad90",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          Post-It Wall
        </Title> */}

        <Center>
          <AddNoteForm onAddNote={handleAddNote} />
        </Center>

        {notes.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#a68a64",
              fontFamily: "'Courier New', monospace",
              fontSize: "1.25rem",
            }}
          >
            No notes yet. Add your first note!
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "2rem",
              width: "100%",
              marginTop: "2rem",
            }}
          >
            {notes.map((note) => (
              <PostItNote
                key={note.id}
                id={note.id}
                content={note.content}
                color={note.color}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </Stack>
    </Container>
  );
};

export default PostItWall;
