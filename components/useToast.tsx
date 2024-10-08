// hooks/useToast.js
import { toast } from 'react-toastify';

const useToast = () => {
  const notifySuccess = (message:string) => {
    toast.success(message, {
      autoClose: 2000
    });
  };

  const notifyError = (message:string) => {
    toast.error(message, {
      autoClose: 2000,
    });
  };

  return { notifySuccess, notifyError };
};

export default useToast;
