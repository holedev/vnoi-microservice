import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250,
});

const GridOrdering = ({
  type,
  data,
  setCourse,
  itemOnClick,
  itemOnDoubleClick,
  orderUpdate,
}) => {
  const [edit, setEdit] = useState(null);

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const updatedItems = reorder(
      data,
      result.source.index,
      result.destination.index
    );

    if (type == 'sections') {
      setCourse((prev) => {
        return {
          ...prev,
          sections: updatedItems,
        };
      });
    }

    if (type == 'lessons') {
      setCourse((prev) => {
        return {
          ...prev,
          lessons: updatedItems,
        };
      });
    }

    orderUpdate(updatedItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {data?.map((item, index) => (
              <Draggable key={item._id} draggableId={item._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                    onDoubleClick={() => {
                      setEdit(item._id == edit ? null : item._id);
                    }}
                    contentEditable={edit == item._id}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      if (edit == item._id) {
                        itemOnDoubleClick(item._id, e.target.innerText);
                        setEdit(null);
                      }
                    }}
                    onClick={() => itemOnClick(item._id)}
                  >
                    {item.title}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default GridOrdering;
