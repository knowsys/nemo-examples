import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

type SearchDialogProps = {
  open: boolean;
  searchValue: string;
  setSearchValue: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SearchDialog({
  open,
  searchValue,
  setSearchValue,
  onClose,
  onConfirm,
}: SearchDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Search Entry</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Search"
          fullWidth
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="e.g. alice, bob"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}