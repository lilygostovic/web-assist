import React from "react";
import { toast, ToastOptions } from "react-toastify";

interface ToastProps {
  message: string;
}

export const ErrorToast: React.FC<ToastProps> = ({ message }) => {
  const toastId = toast.error(message);
  return null;
};

export const InfoToast: React.FC<ToastProps> = ({ message }) => {
  const toastId = toast.info(message);
  return null;
};
