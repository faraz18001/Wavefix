import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getChatSessions, getSessionMessages, sendChatMessage, logout } from '../services/api';

function Chat() {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const username = localStorage.getItem('username') || 'User';

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    async function loadSessions() {
        try {
            const data = await getChatSessions();
            setSessions(data);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        }
    }

    async function loadSession(sessionId) {
        setCurrentSessionId(sessionId);
        setSidebarOpen(false);
        try {
            const msgs = await getSessionMessages(sessionId);
            setMessages(msgs);
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    }

    async function handleNewChat() {
        setCurrentSessionId(null);
        setMessages([]);
        setSidebarOpen(false);
    }

    async function handleSendMessage(e) {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message to UI immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
        setLoading(true);

        try {
            const response = await sendChatMessage(userMessage, currentSessionId);

            // Update session ID if new
            if (!currentSessionId && response.session_id) {
                setCurrentSessionId(response.session_id);
                loadSessions(); // Refresh sidebar to show new chat
            }

            // Add AI response
            setMessages(prev => [...prev, {
                role: 'ai',
                content: response.response,
                sources: response.sources,
                tokens: response.tokens_used,
                cost: response.cost_usd,
                timestamp: new Date()
            }]);

        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `Error: ${err.message}`,
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div className="bg-background-dark text-text-main font-display overflow-hidden h-screen flex">
            {/* Sidebar */}
            <aside className={`w-72 h-full flex flex-col bg-sidebar-bg border-r border-border-subtle shrink-0 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30`}>
                <div className="p-5 border-b border-border-subtle">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 grayscale hover:grayscale-0 transition-all" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDID3ksOyuZr608QrxBoe4b6ufO-2uEK6GccvPtYse71xssfoBkgtxDtAMYERJbe6-MZ2MPGqeXj6UjNIwesAwHLFngCGswdeUl4eIR01JJKF3gDxYQX_v2jeIVFwuW1bwPdmgaeG-7Q66jeX8cjpSJ5i1cVwFbdDeSWOquZEg58gTZJ5BWud3K9xhnDTw04Pz6y9f3wxjEjpOjIyFLMymGre8zvIS5le9nGNX5qdFX9KcX0M2AR_92EQCSDq6zMF6VhW_uQAL2vA")' }}></div>
                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-600 border-2 border-black rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-text-main text-sm font-semibold">{username}</h2>
                            <span className="text-text-muted text-[10px] uppercase tracking-wider">Pro Plan</span>
                        </div>
                    </div>
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 h-9 border border-border-subtle hover:bg-white/5 transition-colors rounded-md text-text-main text-xs font-medium uppercase tracking-wide"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">History</p>
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            onClick={() => loadSession(session.id)}
                            className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${currentSessionId === session.id ? 'bg-white/5 border border-border-subtle/50 text-text-main' : 'hover:bg-white/5 text-text-muted hover:text-text-main'}`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="material-symbols-outlined text-[18px]">{currentSessionId === session.id ? 'terminal' : 'chat_bubble_outline'}</span>
                                <p className="text-sm truncate">{session.name || 'Conversation'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t border-border-subtle">
                    <div
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer text-text-muted hover:text-text-main transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <p className="text-xs font-medium uppercase tracking-wide">Logout</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full bg-background-dark relative">
                <header className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-background-dark shrink-0">
                    <div className="flex flex-col">
                        <h1 className="text-text-main text-sm font-semibold tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-text-muted text-[18px]">terminal</span>
                            {currentSessionId ? `Session: Active Chat` : 'New Chat Session'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/5 text-text-muted hover:text-text-main transition-colors md:hidden"
                        >
                            <span className="material-symbols-outlined text-[20px]">menu</span>
                        </button>
                        <button className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/5 text-text-muted hover:text-text-main transition-colors">
                            <span className="material-symbols-outlined text-[18px]">ios_share</span>
                        </button>
                        <button className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/5 text-text-muted hover:text-text-main transition-colors">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-4 md:px-32 py-8 flex flex-col gap-6 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="flex items-start gap-4 group">
                            <div className="h-8 w-8 shrink-0 bg-white/5 rounded flex items-center justify-center border border-border-subtle">
                                <span className="material-symbols-outlined text-text-muted text-[18px]">smart_toy</span>
                            </div>
                            <div className="flex flex-col gap-2 max-w-[90%] md:max-w-[75%]">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-text-main text-xs font-semibold">WaveFix</span>
                                    <span className="text-text-muted text-[10px] border border-border-subtle px-1 rounded uppercase tracking-wider">System</span>
                                </div>
                                <div className="bg-ai-bubble border border-border-subtle rounded-lg p-5 text-text-main shadow-sm">
                                    <p className="text-[14px] leading-6 text-gray-300">
                                        Hello! I'm WaveFix, your support assistant. I can help with technical queries, documentation, or account support. What's on your mind?
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 group ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'ai' && (
                                <div className="h-8 w-8 shrink-0 bg-white/5 rounded flex items-center justify-center border border-border-subtle">
                                    <span className="material-symbols-outlined text-text-muted text-[18px]">smart_toy</span>
                                </div>
                            )}

                            <div className={`flex flex-col gap-2 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                {msg.role === 'ai' && (
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-text-main text-xs font-semibold">WaveFix</span>
                                        <span className="text-text-muted text-[10px] border border-border-subtle px-1 rounded uppercase tracking-wider">RAG Model</span>
                                    </div>
                                )}

                                <div className={`${msg.role === 'user' ? 'bg-user-bubble text-white shadow-sm border border-blue-900/50' : 'bg-ai-bubble border border-border-subtle text-text-main'} rounded-lg p-5 shadow-sm text-[14px] leading-6`}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                            code: ({ node, inline, ...props }) =>
                                                inline
                                                    ? <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                                                    : <code className="block bg-black/50 p-2 rounded text-xs font-mono my-2 overflow-x-auto whitespace-pre" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
                                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1" {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>

                                    {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                                        <div className="pt-4 mt-4 border-t border-border-subtle">
                                            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wide mb-3 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">library_books</span>
                                                Sources
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {[...new Map(msg.sources.map(src => [src.document_name, src])).values()].map((src, i) => (
                                                    <a key={i} className="flex items-center gap-2 px-3 py-1.5 rounded border border-border-subtle hover:bg-white/5 hover:border-gray-600 transition-all no-underline" href="#" onClick={(e) => e.preventDefault()}>
                                                        <span className="material-symbols-outlined text-[14px] text-text-muted">description</span>
                                                        <span className="text-xs font-medium text-gray-400">{src.document_name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 shrink-0 grayscale opacity-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDRKVnWRKNmFXdIieDZVQtY-yAk_aQmFB5FsEuW6pZC4oSByWdmyRY0DfAbYK8k6IeS2nktpoO4-gJihsLwQb4TOvm7Y-Q2d-KBGz8lAFigsK57K8J6ZOjrWvbFWEB4mEhmJvkA1cdi7KqtwQebdsWaafSHuwXxT2I5sJo7mKOIYDsGks_mm0oKMGh-X96yk30pc7Aqr-i--Ha3pke1L2fgMRdX70ee7w53u3JxYvQ_NqM1GV87UxZ2mdnUTgFE72nOs2eNwprp6w")' }}></div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-start gap-4">
                            <div className="h-8 w-8 shrink-0 bg-white/5 rounded flex items-center justify-center border border-border-subtle">
                                <span className="material-symbols-outlined text-text-muted text-[18px]">smart_toy</span>
                            </div>
                            <div className="bg-ai-bubble border border-border-subtle rounded-lg px-4 py-3 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[typing_1.4s_infinite_ease-in-out_both] [-animation-delay:-0.32s]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[typing_1.4s_infinite_ease-in-out_both] [-animation-delay:-0.16s]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[typing_1.4s_infinite_ease-in-out_both]"></div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-24"></div>
                </div>

                <div className="w-full bg-background-dark border-t border-border-subtle p-6 z-20">
                    <div className="max-w-4xl mx-auto flex flex-col gap-2">
                        <form onSubmit={handleSendMessage} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-zinc-500 text-[20px]">add</span>
                            </div>
                            <input
                                className="w-full bg-black/40 border border-border-subtle text-text-main placeholder-zinc-600 focus:ring-1 focus:ring-zinc-600 focus:border-zinc-500 rounded-md py-3 pl-10 pr-12 text-sm font-normal"
                                placeholder="Message WaveFix..."
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                                <button type="button" className="p-1.5 rounded text-zinc-500 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">mic</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="p-1.5 bg-white text-black rounded hover:bg-zinc-200 transition-colors flex items-center justify-center disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                </button>
                            </div>
                        </form>
                        <p className="text-center text-[10px] text-zinc-600 font-mono mt-1">WaveFix can make mistakes. Please verify important information.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Chat;
