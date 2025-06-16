import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { io } from "../../config/SocketClient";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

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
    markMessagesAsRead,
  } = useChatStore();

  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedOtherId, setSelectedOtherId] = useState<string | null>(null);
  const [selectedOtherName, setSelectedOtherName] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [activeConversations, setActiveConversations] = useState<Set<string>>(new Set());
  const [lastMessages, setLastMessages] = useState<Map<string, { 
    content: string; 
    timestamp: string; 
    senderId: string | undefined 
  }>>(new Map());
  
  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  
  // scroll refs and state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const lastMessageCountRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  const getConversationKey = (otherId: string, eventId: string) => `${otherId}-${eventId}`;

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // scroll detection with debouncing
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 10; 
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) <= threshold;
    return isAtBottom;
  }, []);

 
  const scrollToBottom = useCallback((smooth = false) => {
    if (!messagesContainerRef.current) return;
    
    isScrollingRef.current = true;
    
    const scrollToBottomImmediate = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    };

    if (smooth) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      
      
      setTimeout(scrollToBottomImmediate, 500);
    } else {
      scrollToBottomImmediate();
    }
  }, []);

  
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const isAtBottom = checkIfAtBottom();
      setIsUserAtBottom(isAtBottom);
    }, 50);
  }, [checkIfAtBottom]);

  useEffect(() => {
    const newLastMessages = new Map();
    conversations.forEach(conv => {
      const key = getConversationKey(conv.otherId, conv.eventId);
      newLastMessages.set(key, {
        content: conv.lastMessage || '',
        timestamp: conv.updatedAt || new Date().toISOString(),
        senderId: (conv.lastMessageSenderId ?? '') as string
      });
    });
    setLastMessages(newLastMessages);
  }, [conversations]);

  const sortedConversations = [...conversations].sort((a, b) => {
    const aKey = getConversationKey(a.otherId, a.eventId);
    const bKey = getConversationKey(b.otherId, b.eventId);
    const aTime = lastMessages.get(aKey)?.timestamp || a.updatedAt;
    const bTime = lastMessages.get(bKey)?.timestamp || b.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  useEffect(() => {
    listConversations();
  }, [listConversations]);

  useLayoutEffect(() => {
    const messageCount = messages.length;
    const wasNewMessageAdded = messageCount > lastMessageCountRef.current;
    
    if (wasNewMessageAdded && isUserAtBottom) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom(false);
        });
      });
    }
    
    lastMessageCountRef.current = messageCount;
  }, [messages, isUserAtBottom, scrollToBottom]);

  useEffect(() => {
    if (!currentUserId) return;
    
    console.log('Setting up socket listeners for user:', currentUserId);
    io.emit('joinUserRoom', currentUserId);
    io.emit('userOnline', currentUserId);
    
    const handleNewMessage = (msg: any) => {
      console.log('Received message via socket:', msg);
      
      const senderKey = getConversationKey(msg.senderId, msg.eventId);
      const receiverKey = getConversationKey(msg.receiverId, msg.eventId);
      
      setLastMessages(prev => {
        const newMap = new Map(prev);
        const conversationKey = msg.senderId === currentUserId ? receiverKey : senderKey;
        newMap.set(conversationKey, {
          content: msg.content,
          timestamp: msg.timestamp,
          senderId: msg.senderId
        });
        return newMap;
      });
      
      const isCurrentConversation = selectedEventId && selectedOtherId && 
          msg.eventId === selectedEventId && 
          ((msg.senderId === currentUserId && msg.receiverId === selectedOtherId) ||
           (msg.senderId === selectedOtherId && msg.receiverId === currentUserId));
      
      if (isCurrentConversation) {
        console.log('Adding message to current conversation');
        setMessages((prevMessages: any) => [...prevMessages, msg]);
        
        const isMessageToCurrentUser = msg.receiverId === currentUserId;
        const isFromSelectedContact = msg.senderId === selectedOtherId;
        
        if (isMessageToCurrentUser && isFromSelectedContact) {
          console.log('Marking message as read since conversation is active');
          markMessagesAsRead(selectedOtherId, selectedEventId);
        }
      }
      
      setTimeout(() => listConversations(), 100);
    };

    const handleUserOnline = (userId: string) => {
      console.log('User came online:', userId);
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = (userId: string) => {
      console.log('User went offline:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setActiveConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleConversationJoined = (data: { userId: string, eventId: string, otherId: string }) => {
      console.log('User joined conversation:', data);
      setActiveConversations(prev => new Set([...prev, data.userId]));
    };

    const handleConversationLeft = (data: { userId: string, eventId: string, otherId: string }) => {
      console.log('User left conversation:', data);
      setActiveConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    const handleOnlineUsersList = (users: string[]) => {
      console.log('Received online users list:', users);
      setOnlineUsers(new Set(users));
    };
    
    io.on('receiveMessage', handleNewMessage);
    io.on('userOnline', handleUserOnline);
    io.on('userOffline', handleUserOffline);
    io.on('conversationJoined', handleConversationJoined);
    io.on('conversationLeft', handleConversationLeft);
    io.on('onlineUsers', handleOnlineUsersList);
    
    io.emit('getOnlineUsers');
    
    return () => {
      console.log('Cleaning up socket listeners');
      io.off('receiveMessage', handleNewMessage);
      io.off('userOnline', handleUserOnline);
      io.off('userOffline', handleUserOffline);
      io.off('conversationJoined', handleConversationJoined);
      io.off('conversationLeft', handleConversationLeft);
      io.off('onlineUsers', handleOnlineUsersList);
      
      io.emit('userOffline', currentUserId);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentUserId, selectedEventId, selectedOtherId, setMessages, listConversations, markMessagesAsRead]);

  const openConversation = async (otherId: string, eventId: string, otherName: string) => {
    if (selectedOtherId && selectedEventId) {
      io.emit('leaveConversation', {
        userId: currentUserId,
        eventId: selectedEventId,
        otherId: selectedOtherId
      });
    }

    setSelectedOtherId(otherId);
    setSelectedEventId(eventId);
    setSelectedOtherName(otherName);
    setIsUserAtBottom(true);
    
    io.emit('joinConversation', {
      userId: currentUserId,
      eventId: eventId,
      otherId: otherId
    });
    
    await fetchMessages(otherId, eventId);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      scrollToBottom(false);
    }, 200);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOtherId || !selectedEventId) return;

    const tempMsg = {
      _id: `temp-${Date.now()}`,
      senderId: currentUserId!,
      receiverId: selectedOtherId,
      eventId: selectedEventId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setIsUserAtBottom(true);
    
    setMessages(prev => [...prev, tempMsg]);

    const convKey = getConversationKey(selectedOtherId, selectedEventId);
    setLastMessages(prev => {
      const next = new Map(prev);
      next.set(convKey, {
        content: tempMsg.content,
        timestamp: tempMsg.timestamp,
        senderId: tempMsg.senderId,
      });
      return next;
    });

    setNewMessage("");
    setShowEmojiPicker(false);

    sendMessage(selectedOtherId, selectedEventId, tempMsg.content)
      .catch(err => {
        console.error("Failed to send message:", err);
      });
  }, [newMessage, selectedOtherId, selectedEventId, currentUserId, setMessages, sendMessage]);
  
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

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return formatDate(timestamp);
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const isUserOnline = (userId: string) => onlineUsers.has(userId);
  const isUserActiveInConversation = (userId: string) => activeConversations.has(userId);

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Layout>
      <div className="flex h-[80vh] border rounded-xl shadow-md overflow-hidden bg-white">
        {/* Sidebar with improved scrolling */}
        <aside className="w-1/3 border-r flex flex-col bg-purple-50">
          <div className="p-4 bg-purple-700 text-white flex-shrink-0">
            <h2 className="text-lg font-bold">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isListLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
              </div>
            ) : !sortedConversations.length ? (
              <div className="text-center p-4 text-gray-500">
                No conversations yet.
              </div>
            ) : (
              <div className="space-y-1">
                {sortedConversations.map((conv, i) => {
                  const conversationKey = getConversationKey(conv.otherId, conv.eventId);
                  const lastMsg = lastMessages.get(conversationKey);
                  const displayMessage = lastMsg?.content || conv.lastMessage || 'No messages yet';
                  const displayTime = lastMsg?.timestamp || conv.updatedAt;
                  const isMyMessage = lastMsg?.senderId === currentUserId;
                  
                  return (
                    <div
                      key={i}
                      onClick={() => openConversation(conv.otherId, conv.eventId, conv.otherName)}
                      className={`relative p-3 cursor-pointer rounded-lg transition-all hover:bg-purple-100 ${
                        selectedEventId === conv.eventId && selectedOtherId === conv.otherId
                          ? "bg-purple-200"
                          : "bg-white"
                      }`}
                    >
                      {conv.unreadCount > 0 && (
                        <span className="absolute top-2 right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-purple-600 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                      
                      <div className="flex items-start mb-2">
                        <div className="relative">
                          <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center text-purple-700 font-bold mr-3">
                            {conv.otherName.charAt(0).toUpperCase()}
                          </div>
                          {isUserOnline(conv.otherId) && (
                            <div className="absolute -bottom-0.5 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                          {isUserActiveInConversation(conv.otherId) && selectedEventId === conv.eventId && (
                            <div className="absolute -top-0.5 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">{conv.otherName}</h3>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatRelativeTime(displayTime)}
                            </span>
                          </div>
                          
                          {isUserOnline(conv.otherId) && !displayMessage && (
                            <p className="text-xs text-green-600 font-medium mb-1">online</p>
                          )}
                          
                          <p className="text-sm text-gray-600 truncate">
                            {isMyMessage && lastMsg ? 'You: ' : ''}{displayMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Chat pane with improved scrolling */}
        <section className="w-2/3 flex flex-col bg-gray-50">
          {selectedEventId ? (
            <>
              {/* Chat header - fixed */}
              <div className="p-4 border-b bg-purple-700 text-white flex items-center flex-shrink-0">
                <div className="relative">
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold mr-3">
                    {selectedOtherName?.charAt(0).toUpperCase()}
                  </div>
                  {selectedOtherId && isUserOnline(selectedOtherId) && (
                    <div className="absolute -bottom-0.5 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-medium">{selectedOtherName}</h2>
                  {selectedOtherId && (
                    <p className="text-xs text-purple-200">
                      {isUserActiveInConversation(selectedOtherId) 
                        ? "Active in conversation" 
                        : isUserOnline(selectedOtherId) 
                          ? "Online" 
                          : "Offline"
                      }
                    </p>
                  )}
                </div>
              </div>
              
              {/* Messages container with improved scrolling */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4"
                style={{ 
                  overflowAnchor: 'none' // Critical: Prevents scroll jumping
                }}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(messageGroups).map(([date, dateMessages]) => (
                      <div key={date}>
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {formatDate(dateMessages[0].timestamp)}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {dateMessages.map((m, idx) => {
                            const isMine = m.senderId === currentUserId;
                            return (
                              <div
                                key={`${date}-${idx}`}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`p-3 rounded-lg max-w-xs break-words ${
                                    isMine 
                                      ? "bg-purple-600 text-white" 
                                      : "bg-white border border-gray-200"
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                  <time className={`text-xs block text-right mt-1 ${isMine ? "text-purple-200" : "text-gray-400"}`}>
                                    {formatTime(m.timestamp)}
                                  </time>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {/* Scroll to bottom indicator */}
                    {!isUserAtBottom && (
                      <div className="flex justify-center sticky bottom-0 pb-2">
                        <button
                          onClick={() => {
                            setIsUserAtBottom(true);
                            scrollToBottom(true);
                          }}
                          className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm hover:bg-purple-700 transition-colors shadow-lg"
                        >
                          ↓ Scroll to bottom
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input - fixed */}
              <div className="relative p-3 border-t bg-white flex-shrink-0">
                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="absolute bottom-16 left-3 z-50 shadow-lg rounded-lg"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={300}
                      height={400}
                      searchDisabled={false}
                      skinTonesDisabled={false}
                      previewConfig={{
                        showPreview: false
                      }}
                    />
                  </div>
                )}
                
                <form onSubmit={handleSend}>
                  <div className="flex gap-2 items-end">
                    <button
                      ref={emojiButtonRef}
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex-shrink-0 p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                      title="Add emoji"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.12.23-2.18.65-3.15C5.33 9.5 6.11 10 7 10c.55 0 1.05-.22 1.41-.59.37-.36.59-.86.59-1.41 0-.89-.5-1.67-1.15-2.35C8.82 4.23 9.88 4 12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/>
                        <circle cx="15.5" cy="9.5" r="1.5"/>
                        <circle cx="8.5" cy="9.5" r="1.5"/>
                        <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                      </svg>
                    </button>
                    
                    <textarea
                      className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32 min-h-[40px]"
                      placeholder="Type a message…"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      rows={1}
                      style={{
                        height: 'auto',
                        minHeight: '40px',
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                    
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="flex-shrink-0 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
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