import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface GameChatProps {
  gameId: string;
}

export function GameChat({ gameId }: GameChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { sendMessage: sendWsMessage, lastMessage } = useWebSocket(user?.id);
  const queryClient = useQueryClient();

  // Fetch initial chat messages
  const { data: chatData } = useQuery({
    queryKey: [`/api/games/${gameId}/chat`],
    enabled: !!gameId,
  });

  useEffect(() => {
    if (chatData?.messages) {
      setMessages(chatData.messages);
    }
  }, [chatData]);

  // Listen for new chat messages via WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'chat_message') {
      setMessages(prev => [...prev, lastMessage.data]);
    }
  }, [lastMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendChatMessage = useMutation({
    mutationFn: async (messageText: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await apiRequest("POST", "/api/chat", {
        gameId,
        userId: user.id,
        message: messageText,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/chat`] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Send via WebSocket for real-time delivery
    sendWsMessage({
      type: 'chat_message',
      content: message.trim(),
    });

    setMessage("");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-80 bg-dark-800 border-l border-dark-600 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-dark-600">
        <h3 className="font-semibold">Game Chat</h3>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin" style={{ maxHeight: "400px" }}>
        <div className="text-center text-sm text-gray-400">
          Game started • Good luck!
        </div>
        
        {messages.map((msg, index) => {
          const isOwnMessage = msg.user?.id === user?.id;
          
          return (
            <div
              key={index}
              className={`flex space-x-2 ${isOwnMessage ? 'justify-end' : ''}`}
            >
              {!isOwnMessage && (
                <img
                  src={msg.user?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=24&h=24&fit=crop&crop=face"}
                  alt={msg.user?.username}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
              )}
              <div className={`rounded-lg px-3 py-2 max-w-[80%] ${
                isOwnMessage 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-600 text-white'
              }`}>
                <div className={`text-sm font-medium ${
                  isOwnMessage ? 'text-white' : 'text-primary'
                }`}>
                  {isOwnMessage ? 'You' : msg.user?.username}
                </div>
                <div className="text-sm">{msg.message?.message || msg.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {formatTime(msg.message?.createdAt || new Date().toISOString())}
                </div>
              </div>
              {isOwnMessage && (
                <img
                  src={user?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=24&h=24&fit=crop&crop=face"}
                  alt="You"
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-dark-600">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-dark-600 border-dark-500 text-sm"
            maxLength={200}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!message.trim() || sendChatMessage.isPending}
            className="bg-primary hover:bg-blue-600"
          >
            <i className="fas fa-paper-plane text-sm" />
          </Button>
        </form>
      </div>
    </div>
  );
}
