'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils';
import { MessageCircle, Send, Search, ArrowLeft } from 'lucide-react';

interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

function MessagesContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const convParam = searchParams.get('conversation');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/user/dashboard/messages');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (authLoading) return;
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const { data: convs, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (convError) {
          console.error('Error fetching conversations:', convError);
          setIsLoading(false);
          return;
        }

        if (!convs || convs.length === 0) {
          setConversations([]);
          setIsLoading(false);
          return;
        }

      const conversationsWithDetails = await Promise.all(
        convs.map(async (conv) => {
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;

          const [userRes, productRes, lastMsgRes, unreadRes] = await Promise.all([
            supabase.from('profiles').select('name, avatar_url').eq('id', otherUserId).maybeSingle(),
            supabase.from('products').select('title').eq('id', conv.product_id).maybeSingle(),
            supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1),
            supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .is('read_at', null),
          ]);

          const productImagesRes = await supabase
            .from('product_images')
            .select('url')
            .eq('product_id', conv.product_id)
            .order('position', { ascending: true })
            .limit(1);

          const productTitle = productRes?.data?.title || 'Producto';
          const productImage = productImagesRes.data && productImagesRes.data.length > 0 
            ? productImagesRes.data[0].url 
            : '';
          const lastMsg = lastMsgRes.data && lastMsgRes.data.length > 0 ? lastMsgRes.data[0] : null;
          
          return {
            id: conv.id,
            productId: conv.product_id,
            productTitle: productTitle,
            productImage: productImage,
            otherUserId,
            otherUserName: userRes.data?.name || 'Usuario',
            otherUserAvatar: userRes.data?.avatar_url || '',
            lastMessage: lastMsg?.content || 'Sin mensajes',
            lastMessageAt: lastMsg?.created_at || conv.created_at,
            unreadCount: unreadRes.count || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);

        if (convParam) {
          const found = conversationsWithDetails.find(c => c.id === convParam);
          if (found) setSelectedConversation(found);
        }
      } catch (err) {
        console.error('Error in fetchConversations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user, supabase, convParam, authLoading]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      setIsLoadingMessages(true);
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      setMessages(data || []);
      setIsLoadingMessages(false);
    };

    fetchMessages();
  }, [selectedConversation, supabase]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
      await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender_id: user.id,
        created_at: new Date().toISOString(),
      };
      setMessages([...messages, newMsg]);
      
      const updatedConvs = conversations.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, lastMessage: newMessage.trim(), lastMessageAt: new Date().toISOString() }
          : c
      );
      setConversations(updatedConvs);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error al enviar mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/user/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-[#112237]">Mensajes</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#e2e8f0]">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full p-4 text-left hover:bg-[#f8fafc] transition-colors ${
                          selectedConversation?.id === conv.id ? 'bg-[#f8fafc]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={conv.otherUserAvatar}
                            alt={conv.otherUserName}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-[#112237] truncate">
                                {conv.otherUserName}
                              </p>
                              {conv.unreadCount > 0 && (
                                <Badge variant="default" className="shrink-0">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#64748b] truncate">
                              {conv.productTitle}
                            </p>
                            <p className="text-xs text-[#94a3b8] mt-1">
                              {formatRelativeTime(conv.lastMessageAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
                      <p className="text-[#64748b]">No hay conversaciones</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-6 h-[500px] flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="flex items-center gap-4 pb-4 border-b border-[#e2e8f0] mb-4">
                      <Avatar src={selectedConversation.otherUserAvatar} size="md" />
                      <div>
                        <p className="font-medium text-[#112237]">
                          {selectedConversation.otherUserName}
                        </p>
                        <p className="text-sm text-[#64748b]">
                          {selectedConversation.productTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 p-4">
                      {isLoadingMessages ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-[#f25c05] border-t-transparent rounded-full" />
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                msg.sender_id === user?.id
                                  ? 'bg-[#f25c05] text-white'
                                  : 'bg-[#f1f5f9] text-[#112237]'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/70' : 'text-[#94a3b8]'}`}>
                                {formatRelativeTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-[#64748b] py-8">
                          <MessageCircle className="w-10 h-10 mx-auto mb-2 text-[#94a3b8]" />
                          <p className="text-sm">No hay mensajes aún</p>
                          <p className="text-xs">¡Inicia la conversación!</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#e2e8f0]">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Escribe un mensaje..."
                          className="flex-1"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
                      <p className="text-lg font-medium text-[#112237] mb-2">
                        Selecciona una conversación
                      </p>
                      <p className="text-[#64748b]">
                        Elige una conversación del panel izquierdo para ver los mensajes
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}