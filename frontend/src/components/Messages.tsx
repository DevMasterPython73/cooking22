import { useMessages } from '../context/MessageContext';

export const Messages = () => {
    const { messages, removeMessage } = useMessages();

    if (messages.length === 0) return null;

    return (
        <div className="messages-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1050 }}>
            {messages.map(message => (
                <div
                    key={message.id}
                    className={`alert alert-${message.type} alert-dismissible fade show`}
                    role="alert"
                >
                    {message.text}
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                        onClick={() => removeMessage(message.id)}
                    />
                </div>
            ))}
        </div>
    );
};
