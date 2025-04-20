import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { io } from "../../config/SocketClient";

export type ChatInboxProps = {
  Layout: React.ComponentType<{ children: React.ReactNode }>;
};

export function ChatInbox({ Layout }: ChatInboxProps) {
  const {
    conversations,
    listConversations,
    isListLoading,
    messages,
    setMessages,
    fetchMessages,
    sendMessage,
    isLoading,
  } = useChatStore();

  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedOtherId, setSelectedOtherId] = useState<string | null>(null);
  const [selectedOtherName, setSelectedOtherName] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listConversations();
  }, [listConversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 
  useEffect(() => {
    if (!currentUserId) return;
    
    console.log('Joining personal room for user:', currentUserId);
    io.emit('joinUserRoom', currentUserId);
    
    const handleNewMessage = (msg: any) => {
      console.log('Received message via socket:', msg);
      
      
      if (selectedEventId && selectedOtherId && 
          msg.eventId === selectedEventId && 
          ((msg.senderId === currentUserId && msg.receiverId === selectedOtherId) ||
           (msg.senderId === selectedOtherId && msg.receiverId === currentUserId))) {
        console.log('Adding message to current conversation');
        setMessages((prevMessages: any) => [...prevMessages, msg]);
      } else {
        console.log('Message for different conversation, refreshing conversation list');
        
        listConversations();
      }
    };
    
    io.on('receiveMessage', handleNewMessage);
    
    return () => {
      console.log('Removing socket event listener');
      io.off('receiveMessage', handleNewMessage);
    };
  }, [currentUserId, selectedEventId, selectedOtherId, setMessages, listConversations]);

  const openConversation = async (otherId: string, eventId: string, otherName: string) => {
    setSelectedOtherId(otherId);
    setSelectedEventId(eventId);
    setSelectedOtherName(otherName);
    await fetchMessages(otherId, eventId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOtherId || !selectedEventId) return;
    await sendMessage(selectedOtherId, selectedEventId, newMessage.trim());
    setNewMessage("");
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Layout>
      <div className="flex h-[80vh] border rounded-xl shadow-md overflow-hidden bg-white">
        {/* Sidebar */}
        <aside className="w-1/3 border-r overflow-y-auto bg-purple-50">
          <div className="p-4 bg-purple-700 text-white">
            <h2 className="text-lg font-bold">Messages</h2>
          </div>
          <div className="p-2">
            {isListLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
              </div>
            ) : !conversations.length ? (
              <div className="text-center p-4 text-gray-500">
                No conversations yet.
              </div>
            ) : (
              conversations.map((conv, i) => (
                <div
                  key={i}
                  onClick={() => openConversation(conv.otherId, conv.eventId, conv.otherName)}
                  className={`relative p-3 mb-1 cursor-pointer rounded-lg transition-all hover:bg-purple-100 ${
                    selectedEventId === conv.eventId && selectedOtherId === conv.otherId
                      ? "bg-purple-200"
                      : "bg-white"
                  }`}
                >
                  {/* Unread badge */}
                  {conv.unreadCount > 0 && (
                    <span className="absolute top-3 right-3 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-purple-600 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                  <div className="flex items-center mb-1">
                    <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center text-purple-700 font-bold mr-3">
                      {conv.otherName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{conv.otherName}</h3>
                      <p className="text-xs text-gray-500">{formatDate(conv.updatedAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate pl-12">{conv.lastMessage}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat pane */}
        <section className="w-2/3 flex flex-col bg-gray-50">
          {selectedEventId ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b bg-purple-700 text-white flex items-center">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold mr-3">
                  {selectedOtherName?.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-medium">{selectedOtherName}</h2>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMine = m.senderId === currentUserId;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-xs ${
                            isMine 
                              ? "bg-purple-600 text-white" 
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{m.content}</p>
                          <time className={`text-xs block text-right mt-1 ${isMine ? "text-purple-200" : "text-gray-400"}`}>
                            {formatTime(m.timestamp)}
                          </time>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input */}
              <form onSubmit={handleSend} className="p-3 border-t bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type a message…"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-purple-700 mb-2">Select a conversation</h3>
              <p className="text-center">Choose a conversation from the sidebar to start messaging</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}