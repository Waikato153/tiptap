import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import Slide from '@mui/material/Slide';

interface SuccessSnackbarProps {
  open: boolean;
  handleClose: () => void;
  message?: string;
  severity?: AlertColor; // 明确定义为 AlertColor 类型
}

const SuccessSnackbar: React.FC<SuccessSnackbarProps> = ({
                                                           open,
                                                           handleClose,
                                                           message = "Operation successful!",
                                                           severity = "success",
                                                         }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={(props) => <Slide {...props} direction="down" />}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessSnackbar;
