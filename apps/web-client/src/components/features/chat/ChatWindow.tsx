'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Message, Conversation, User } from '@/types';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onSendImage?: (imageUrl: string) => void;
  isLoading?: boolean;
}

export const ChatWindow = ({
  conversation,
  currentUserId,
  messages,
  onSendMessage,
  onSendImage,
  isLoading = false,
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUser = conversation.buyerId === currentUserId
    ? conversation.seller
    : conversation.buyer;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-[#e2e8f0]">
      <div className="flex items-center gap-3 p-4 border-b border-[#e2e8f0]">
        <Avatar
          src={otherUser?.avatarUrl}
          alt={otherUser?.name || 'Usuario'}
          size="md"
          showProBadge={otherUser?.isPro}
        />
        <div>
          <h4 className="font-medium text-[#112237]">
            {otherUser?.name || 'Usuario'}
          </h4>
          {conversation.product && (
            <p className="text-xs text-[#64748b] truncate max-w-[200px]">
              {conversation.product.title}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2',
                  isOwn
                    ? 'bg-[#f25c05] text-white rounded-br-md'
                    : 'bg-[#f8fafc] text-[#112237] rounded-bl-md'
                )}
              >
                <p className="text-sm">{message.content}</p>
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Imagen"
                    className="mt-2 rounded-lg max-w-full"
                  />
                )}
                <p
                  className={cn(
                    'text-[10px] mt-1',
                    isOwn ? 'text-white/70' : 'text-[#94a3b8]'
                  )}
                >
                  {formatRelativeTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center text-[#64748b] py-8">
            <p>No hay mensajes aún</p>
            <p className="text-sm">¡Inicia la conversación!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#e2e8f0]">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};