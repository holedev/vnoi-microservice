import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { Box, IconButton, Tooltip } from "@mui/material";
import Alert from "@mui/material/Alert";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 6;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  display: "flex",
  alignItems: "center",

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",
  borderRadius: "4px",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: 0,
  width: 250
});

const GridOrdering = ({ type, data, setCourse, handleOpenItem, handleRenameItem, orderUpdate, handleDeleteItem }) => {
  const [edit, setEdit] = useState(null);

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const updatedItems = reorder(data, result.source.index, result.destination.index);

    if (type == "sections") {
      setCourse((prev) => {
        return {
          ...prev,
          sections: updatedItems
        };
      });
    }

    if (type == "lessons") {
      setCourse((prev) => {
        return {
          ...prev,
          lessons: updatedItems
        };
      });
    }

    orderUpdate(updatedItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='droppable'>
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
            {data?.map((item, index) => (
              <Draggable key={item._id} draggableId={item._id} index={index}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                    onDoubleClick={() => {
                      setEdit(item._id == edit ? null : item._id);
                    }}
                  >
                    <Box
                      onBlur={(e) => {
                        if (edit == item._id) {
                          handleRenameItem(item._id, e.target.innerText);
                          setEdit(null);
                        }
                      }}
                      contentEditable={edit == item._id}
                      suppressContentEditableWarning={true}
                      sx={{ flex: 1, border: "none", outline: "none" }}
                    >
                      {item.title}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <Tooltip title='Open'>
                        <IconButton onClick={() => handleOpenItem(item._id)}>
                          <FolderOpenIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton onClick={() => handleDeleteItem(item._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
              </Draggable>
            ))}
            {data?.length == 0 && (
              <Alert variant='outlined' severity='info'>
                No items to show.
              </Alert>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default GridOrdering;
