import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '1px solid #ccc',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  borderRadius: '6px',
};

export default function ChildModal({ open, setOpen, children }) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="child-modal-title"
      aria-describedby="child-modal-description"
    >
      <Box sx={{ ...style, minWidth: 500 }}>{children}</Box>
    </Modal>
  );
}
