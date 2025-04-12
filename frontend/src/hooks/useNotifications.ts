import { useMessages } from '../context/MessageContext';

export const useNotifications = () => {
    const { addMessage } = useMessages();

    return {
        showSuccess: (message: string) => addMessage(message, 'success'),
        showError: (message: string) => addMessage(message, 'danger'),
        showInfo: (message: string) => addMessage(message, 'info'),
        showWarning: (message: string) => addMessage(message, 'warning'),
    };
};
