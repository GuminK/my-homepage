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
  sender: Pick<User, 'id' | 'nickname' | 'profileImageUrl'>;
  receiver: Pick<User, 'id' | 'nickname' | 'profileImageUrl'>;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  sender: Pick<User, 'id' | 'nickname'>;
  content: string;
  sentAt: string;
}
