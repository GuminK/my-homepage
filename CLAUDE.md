# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

포트폴리오용 개인 홈페이지. Spring Boot 3 백엔드 + React 프론트엔드 풀스택 프로젝트.
JPA 사용
react는 axios를 사용
공통된 기능이 많을 시 컴포넌트로 분리

## Architecture

- Controller -> Service -> Repository 3-layer only
- No business logic in controllers
- 모든 데이터베이스 접근은 Repository에서 접근

### Backend 패키지 구조

`global/` (공통) + `domain/` (기능별) 분리. 각 도메인은 `Entity → Repository → Service → Controller` 구조, DTO는 도메인 `dto/` 하위.

- `global/common/` — `BaseEntity` (createdAt/updatedAt 자동), `ApiResponse<T>` (통일된 응답 래퍼)
- `global/error/` — `ErrorCode` enum → `BusinessException` → `GlobalExceptionHandler`
- `global/security/` — `JwtProvider`, `JwtAuthenticationFilter`, `CustomUserDetails`/`Service`
- `global/config/` — `SecurityConfig`, `WebSocketConfig`, `S3Config`, `MinioInitializer`

**Security 규칙** (`SecurityConfig`):
- 비인증 허용: `GET /api/v1/posts/**`, `GET /api/v1/notices/**`, `/api/v1/auth/**`, `/ws/**`, Swagger
- `ROLE_ADMIN` 전용: `POST/PUT/DELETE /api/v1/notices/**`
- 나머지 전부 인증 필요

**파일 저장**: MinIO (S3 호환, AWS SDK v2). 업로드 후 `http://localhost:9000/{bucket}/{uuid}.ext` 전체 URL 저장. `MinioInitializer`가 시작 시 버킷 생성 및 public-read 정책 자동 적용.

**파일 첨부 흐름**: `POST /api/v1/files` → `fileId` 반환 → 게시글 생성 시 `fileIds` 배열 포함 → `FileInfo.attachToPost(post)`로 연결.

**N+1 방지**: `PostRepository.findByIdWithDetails`는 `JOIN FETCH p.author LEFT JOIN FETCH p.attachments` 단일 쿼리.

**WebSocket/채팅**: STOMP over SockJS. publish: `/pub/chat/send/{roomId}`, subscribe: `/sub/chat/{roomId}`

### Frontend 구조

**상태관리**: Zustand (`authStore`, `accessToken` localStorage persist) + TanStack Query (서버 상태 캐싱).

**API 클라이언트** (`src/api/axios.ts`): 요청마다 `Authorization: Bearer {token}` 자동 추가. 401 시 자동 로그아웃 + `/login` 리다이렉트.

**경로 별칭**: `@/` = `src/`. 라우팅: `ProtectedRoute`로 인증 페이지 보호 (`posts/new`, `chat`). 폼: react-hook-form + zod.

**SockJS import 주의** (ESM 호환 문제):
```typescript
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
```

**미디어 렌더링** (`PostDetailPage`): `IMAGE` → `<img>`, `VIDEO` → `<video controls className="max-h-96">`, 그 외 → 다운로드 링크. 구 상대경로 URL(`/myhomepage/...`)은 `http://localhost:9000` prepend 처리.

**조회수**: `staleTime: 0` + 상세 로드 시 목록 캐시 invalidate.

## Development Setup

인프라 서비스는 Docker Compose로 실행. **주의**: 로컬에 PostgreSQL 설치 시 포트 충돌로 5433으로 매핑.

서버 실행 전 **항상 아래 순서로** Docker를 먼저 시작:
```powershell
# 1. Docker Desktop 실행
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
# (Docker가 준비될 때까지 대기 후)

# 2. 컨테이너 시작
docker-compose up -d
# PostgreSQL: localhost:5433, Redis: localhost:6379, MinIO: localhost:9000 (Console: 9001)
```

**환경변수** (`application-dev.yml` 기준):
- DB: `localhost:5433/myhomepage` (postgres / postgres)
- MinIO: `http://localhost:9000`, `minioadmin / minioadmin`
- JWT secret: `dev-secret-key-minimum-256-bits-long-for-hs256`

### Backend

```bash
cd backend
.\gradlew bootRun       # 개발 서버 (profile: dev, port 8080)
.\gradlew build -x test
.\gradlew test
```

Swagger UI: `http://localhost:8080/swagger-ui.html`

### Frontend

```bash
cd frontend
npm run dev    # 기본 3000, 점유 시 3001로 자동 변경
npm run build  # tsc + vite build
npm run lint
```

Vite가 `/api` → `localhost:8080`, `/ws` → `localhost:8080`(WebSocket) 프록시.

## API 테스트

PowerShell에서 multipart 업로드는 `Invoke-WebRequest` 오류 → `curl.exe` 사용:

```powershell
$r = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method POST `
     -ContentType "application/json" -Body '{"email":"...","password":"..."}' -UseBasicParsing
$token = ($r.Content | ConvertFrom-Json).data.accessToken

curl.exe -s -X POST "http://localhost:8080/api/v1/files" `
  -H "Authorization: Bearer $token" `
  -F "file=@`"path/to/file`";type=video/mp4"
```
