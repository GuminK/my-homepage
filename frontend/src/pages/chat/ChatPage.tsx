import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
import api from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse, ChatRoom, ChatMessage } from '@/types';
import dayjs from 'dayjs';

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, accessToken } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const stompRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: rooms } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => api.get<ApiResponse<ChatRoom[]>>('/chat/rooms'),
  });

  useEffect(() => {
    if (!roomId || !accessToken) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      onConnect: () => {
        client.subscribe(`/sub/chat/${roomId}`, (msg) => {
          const message: ChatMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, message]);
        });
      },
    });

    client.activate();
    stompRef.current = client;

    return () => { client.deactivate(); };
  }, [roomId, accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/pub/chat/send/${roomId}`,
      body: JSON.stringify({ content: input }),
    });
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* 채팅방 목록 */}
      <div className="w-64 bg-white rounded-lg shadow overflow-y-auto">
        <div className="p-4 border-b font-medium">채팅 목록</div>
        {rooms?.data.data.map((room) => {
          const other = room.sender.id === user?.id ? room.receiver : room.sender;
          return (
            <a
              key={room.id}
              href={`/chat/${room.id}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${roomId === String(room.id) ? 'bg-blue-50' : ''}`}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
              <span className="text-sm">{other.nickname}</span>
            </a>
          );
        })}
      </div>

      {/* 채팅 영역 */}
      {roomId ? (
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => {
              const isMine = msg.sender.id === user?.id;
              return (
                <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && <span className="text-xs text-gray-500 self-end mr-1">{msg.sender.nickname}</span>}
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
          채팅방을 선택하세요
        </div>
      )}
    </div>
  );
}
