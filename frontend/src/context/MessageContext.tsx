import { createContext, useContext, useState, useCallback } from 'react';

type MessageType = 'success' | 'info' | 'warning' | 'danger';

interface Message {
    id: number;
    text: string;
    type: MessageType;
}

interface MessageContextType {
    messages: Message[];
    addMessage: (text: string, type: MessageType) => void;
    removeMessage: (id: number) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);

    const addMessage = useCallback((text: string, type: MessageType) => {
        const id = Date.now();
        setMessages(prev => [...prev, { id, text, type }]);

        // Автоматически удаляем сообщение через 5 секунд
        setTimeout(() => {
            removeMessage(id);
        }, 5000);
    }, []);

    const removeMessage = useCallback((id: number) => {
        setMessages(prev => prev.filter(message => message.id !== id));
    }, []);

    return (
        <MessageContext.Provider value={{ messages, addMessage, removeMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
};
