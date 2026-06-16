export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  profileImageUrl?: string;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: Pick<User, 'id' | 'nickname' | 'profileImageUrl'>;
  viewCount: number;
  attachments: FileInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  author: Pick<User, 'id' | 'nickname' | 'profileImageUrl'>;
  replies: Comment[];
  createdAt: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  author: Pick<User, 'id' | 'nickname'>;
  createdAt: string;
  updatedAt: string;
}

export interface FileInfo {
  id: number;
  originalName: string;
  fileUrl: string;
  fileType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  fileSize: number;
}

export interface ChatRoom {
  id: number;
  senderId: number;
  senderNickname: string;
  receiverId: number;
  receiverNickname: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderNickname: string;
  content: string;
  sentAt: string;
}

export interface ChordSheet {
  id: number;
  title: string;
  artist: string;
  content: string;
  capo: number;
  author: Pick<User, 'id' | 'nickname'>;
  createdAt: string;
  updatedAt: string;
}

export interface ChordSheetListItem {
  id: number;
  title: string;
  artist: string;
  capo: number;
  author: Pick<User, 'id' | 'nickname'>;
  createdAt: string;
}

export interface GlobalChatMessage {
  id: number;
  senderId: number;
  senderNickname: string;
  content: string;
  sentAt: string;
}
