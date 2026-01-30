import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Tooltip } from '@mui/material';

type SettingsMenuProps = {
  open: boolean;
  mode: "explore" | "query";
  setMode: (mode: "explore" | "query") => void;
  onClose: () => void;
  resetExplore: () => void;
  setFocusedClicked: () => void
};

export default function SettingsMenu({ open, mode, setMode, onClose, resetExplore, setFocusedClicked }: SettingsMenuProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Mode</DialogTitle>
      <DialogContent>
        <RadioGroup
          value={mode}
          onChange={e => {
            setMode(e.target.value as "explore" | "query")
            if(e.target.value !== "explore") {
              resetExplore(); // Reset the explore state when switching to query mode
              setFocusedClicked()
            }
          }}
        >
          <Tooltip title="Interactively browse and explore the tree." placement="right" enterDelay={500}>
            <FormControlLabel value="explore" control={<Radio />} label="Explore" />
          </Tooltip>
          <Tooltip title="Interactively edit the tree and query results." placement="right" enterDelay={500}>
            <FormControlLabel value="query" control={<Radio />} label="Query" />
          </Tooltip>
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}