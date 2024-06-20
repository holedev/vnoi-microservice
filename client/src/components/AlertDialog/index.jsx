import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function AlertDialog({ open, setOpen, handleAction, title = "Notify", content }) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleProcess = () => {
    handleAction();
    setOpen(false);
  };

  return (
    <Dialog scroll='paper' open={open} onClose={handleClose}>
      <DialogTitle
        sx={{
          fontWeight: "bold"
        }}
        id='alert-dialog-title'
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleProcess}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AlertDialog;
