// StyledDialogWrapper.tsx
// This file wraps our functions in the StyledDialog.tsx
// for react-specific purposes. This one exports the 
// necessary functions our clients should use to make
// the confirmation pop ups appear on the browser

import { createConfirmation } from "react-confirm";

import {
  StyledAcceptDialogProps,
  StyledAlertDialog,
  StyledConfirmDialog,
  StyledConfirmDialogProps,
} from "./StyledDialog";

const alertDialog = createConfirmation(StyledAlertDialog);
const confirmDialog = createConfirmation(StyledConfirmDialog);

export function alertMUI(
  message: string,
  options: Omit<StyledAcceptDialogProps, "message"> = {},
) {
  return alertDialog({
    ...options,
    message,
  });
}

export function confirmMUI(
  message: string,
  options: Omit<StyledConfirmDialogProps, "message"> = {},
) {
  return confirmDialog({
    ...options,
    message,
  });
}
