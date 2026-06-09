import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
import api from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse, ChatRoom, ChatMessage, GlobalChatMessage, User } from '@/types';
import dayjs from 'dayjs';

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [globalMessages, setGlobalMessages] = useState<GlobalChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<'rooms' | 'users' | 'global'>('rooms');

  const stompRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const globalBottomRef = useRef<HTMLDivElement>(null);

  const { data: rooms } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => api.get<ApiResponse<ChatRoom[]>>('/chat/rooms'),
  });

  const { data: chatUsers } = useQuery({
    queryKey: ['chatUsers'],
    queryFn: () => api.get<ApiResponse<User[]>>('/chat/users'),
    enabled: tab === 'users',
    gcTime: 0,
  });

  // 1:1 채팅방 WebSocket 연결
  useEffect(() => {
    if (!roomId || !accessToken) return;
    let cancelled = false;
    let client: Client | null = null;

    const init = async () => {
      const historyRes = await api.get<ApiResponse<ChatMessage[]>>(`/chat/rooms/${roomId}/messages`);
      if (cancelled) return;
      setMessages(historyRes.data.data);

      client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: { Authorization: `Bearer ${accessToken}` },
        onConnect: () => {
          client!.subscribe(`/sub/chat/${roomId}`, (msg) => {
            const message: ChatMessage = JSON.parse(msg.body);
            setMessages((prev) => [...prev, message]);
          });
        },
      });
      client.activate();
      stompRef.current = client;
    };

    init();
    return () => {
      cancelled = true;
      stompRef.current?.deactivate();
    };
  }, [roomId, accessToken]);

  // 전체 채팅 WebSocket 연결
  useEffect(() => {
    if (tab !== 'global' || !accessToken) return;
    let cancelled = false;
    let client: Client | null = null;

    const init = async () => {
      const histRes = await api.get<ApiResponse<GlobalChatMessage[]>>('/chat/global/messages');
      if (cancelled) return;
      setGlobalMessages(histRes.data.data);

      client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: { Authorization: `Bearer ${accessToken}` },
        onConnect: () => {
          client!.subscribe('/sub/global', (msg) => {
            const message: GlobalChatMessage = JSON.parse(msg.body);
            setGlobalMessages((prev) => [...prev, message]);
          });
        },
      });
      client.activate();
      stompRef.current = client;
    };

    init();
    return () => {
      cancelled = true;
      client?.deactivate();
    };
  }, [tab, accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    globalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [globalMessages]);

  const { mutate: startChat } = useMutation({
    mutationFn: (targetUserId: number) =>
      api.post<ApiResponse<ChatRoom>>(`/chat/rooms/${targetUserId}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      navigate(`/chat/${res.data.data.id}`);
      setTab('rooms');
    },
  });

  const sendMessage = () => {
    if (!input.trim() || !stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/pub/chat/send/${roomId}`,
      body: JSON.stringify({ content: input }),
    });
    setInput('');
  };

  const sendGlobalMessage = () => {
    if (!input.trim() || !stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: '/pub/global/send',
      body: JSON.stringify({ content: input }),
    });
    setInput('');
  };

  const getOtherNickname = (room: ChatRoom) =>
    room.senderId === user?.id ? room.receiverNickname : room.senderNickname;

  const isGlobal = tab === 'global';

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* 사이드바 */}
      <div className="w-64 bg-white rounded-lg shadow flex flex-col">
        <div className="flex border-b">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'global' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            전체
          </button>
          <button
            onClick={() => setTab('rooms')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'rooms' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            대화 목록
          </button>
          <button
            onClick={() => setTab('users')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            사용자
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'global' && (
            <p className="text-center text-sm text-gray-400 py-6">모두가 참여하는 채팅방입니다</p>
          )}
          {tab === 'rooms' && (
            rooms?.data.data.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">대화 목록이 없습니다</p>
            ) : (
              rooms?.data.data.map((room) => (
                <Link
                  key={room.id}
                  to={`/chat/${room.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${roomId === String(room.id) ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                  <span className="text-sm">{getOtherNickname(room)}</span>
                </Link>
              ))
            )
          )}
          {tab === 'users' && (
            chatUsers?.data.data.map((u) => (
              <button
                key={u.id}
                onClick={() => startChat(u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                <span className="text-sm">{u.nickname}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      {isGlobal ? (
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b font-semibold text-sm">전체 채팅</div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {globalMessages.map((msg, i) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <span className="text-xs text-gray-500 self-end mr-1">{msg.senderNickname}</span>
                  )}
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 self-end ml-1">
                    {dayjs(msg.sentAt).format('HH:mm')}
                  </span>
                </div>
              );
            })}
            <div ref={globalBottomRef} />
          </div>
          <div className="p-4 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendGlobalMessage()}
              placeholder="메시지를 입력하세요"
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendGlobalMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              전송
            </button>
          </div>
        </div>
      ) : roomId ? (
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <span className="text-xs text-gray-500 self-end mr-1">{msg.senderNickname}</span>
                  )}
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 self-end ml-1">
                    {dayjs(msg.sentAt).format('HH:mm')}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="p-4 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="메시지를 입력하세요"
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              전송
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-lg shadow flex items-center justify-center text-gray-400">
          채팅방을 선택하거나 사용자 탭에서 대화를 시작하세요
        </div>
      )}
    </div>
  );
}
