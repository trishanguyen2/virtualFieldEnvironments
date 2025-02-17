// StyledDialog.tsx
// Functions used to style our confirmation pop ups using
// the 'react-confirm' library. This file defines the 
// layout of our generic pop ups in both an alert and
// basic confirmation components.

import { ThemeProvider } from "@emotion/react";
import { ConfirmDialogProps, confirmable } from "react-confirm";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { theme } from "../main";

export interface StyledAcceptDialogProps {
  message: string;
  accept?: string;
  details?: string;
}

function StyledAlert({
  show,
  proceed,
  message,
  accept,
  details,
}: ConfirmDialogProps<StyledAcceptDialogProps, void>) {
  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={show}
        onClose={() => {
          proceed();
        }}
      >
        <DialogTitle>{message}</DialogTitle>
        {details && (
          <DialogContent>
            <Typography>{details}</Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              proceed();
            }}
          >
            {accept ?? "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export interface StyledConfirmDialogProps {
  message: string;
  accept?: string;
  details?: string;
}

function StyledConfirm({
  show,
  proceed,
  message,
  accept,
  details,
}: ConfirmDialogProps<StyledConfirmDialogProps, boolean>) {
  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={show}
        onClose={() => {
          proceed(false);
        }}
      >
        <DialogTitle>{message}</DialogTitle>
        {details && (
          <DialogContent>
            <Typography>{details}</Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              proceed(false);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              proceed(true);
            }}
            color={
              accept === "Delete" || accept === "Remove" ? "error" : "primary"
            }
          >
            {accept ?? "Continue"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

// These constants are exported only so the wrapper functions in the StyledDialogWrapper.tsx
// file can use them. They should not be used directly. Splitting the files up is necessary because
// React Fast Refresh will not work if components and functions are exported from the same file.
export const StyledAlertDialog = confirmable(StyledAlert);
export const StyledConfirmDialog = confirmable(StyledConfirm);
