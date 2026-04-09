# RE:Node — AI 기반 지식 그래프 학습 플랫폼

> **KoreaIT Academy** 전용 적응형 복습 플랫폼  
> 강의 내용을 AI가 분석하여 지식 그래프로 시각화하고, 학생 맞춤형 과제를 자동 생성합니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [주요 기능](#2-주요-기능)
3. [기술 스택](#3-기술-스택)
4. [아키텍처](#4-아키텍처)
5. [계정 정보](#5-계정-정보)
6. [강의 목록](#6-강의-목록)
7. [로컬 개발 환경](#7-로컬-개발-환경)
8. [환경 변수](#8-환경-변수)
9. [배포](#9-배포)
10. [API 명세](#10-api-명세)

---

## 1. 프로젝트 개요

RE:Node는 강사가 업로드한 강의 텍스트를 Gemini AI가 분석하여 **지식 그래프(Knowledge Graph)**를 자동 생성하고, 학생이 원하는 개념 노드를 선택하면 **맞춤형 복습 과제**를 즉시 생성해 주는 플랫폼입니다.

매니저는 강의별·학생별 **학습 참여도 대시보드**로 전체 현황을 모니터링할 수 있습니다.

---

## 2. 주요 기능

### 학생 (Student)
| 기능 | 설명 |
|------|------|
| 지식 그래프 탐색 | 강의 개념들의 연결 관계를 인터랙티브 그래프로 시각화 |
| 개념 노드 선택 | 복습하고 싶은 개념을 클릭·선택 |
| AI 과제 생성 | 선택된 개념 기반 단답형·개념설명·비교·요약·미니퀴즈 자동 생성 |
| 답안 제출 | 생성된 과제에 직접 답안 작성 및 제출 |

### 강사 (Instructor)
| 기능 | 설명 |
|------|------|
| 강의 생성 | 강의 제목·설명 입력 후 강의 개설 |
| 텍스트 업로드 | 강의 내용 텍스트 업로드 → 자동 지식 그래프 생성 |
| 학생 과제 현황 | 수강생별 과제 생성·제출 내역 드릴다운 조회 |
| 수강생 관리 | 학생 직접 등록 |

### 매니저 (Manager)
| 기능 | 설명 |
|------|------|
| 전체 분석 대시보드 | 강사별·강의별 참여율 한눈에 조회 |
| 학생별 참여도 | 강의 클릭 → 수강생 참여 수준(높음/보통/낮음/미참여) 확인 |
| 과제·제출 현황 | 강의별 생성 건수·제출 건수 집계 |

### 관리자 (Admin)
- 전체 사용자·강의 관리
- 모든 역할의 기능 접근 가능

---

## 3. 기술 스택

### Backend
| 구성 요소 | 기술 |
|-----------|------|
| 웹 프레임워크 | FastAPI (Python 3.11) |
| ORM | SQLAlchemy (async) + asyncpg |
| 관계형 DB | PostgreSQL 16 (Google Cloud SQL) |
| 그래프 DB | Neo4j Aura (Cloud) |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| 파일 스토리지 | Google Cloud Storage |
| 인증 | JWT (python-jose) + bcrypt |

### Frontend
| 구성 요소 | 기술 |
|-----------|------|
| 프레임워크 | React 18 + Vite |
| 스타일링 | Tailwind CSS |
| 라우팅 | React Router v6 |
| HTTP 클라이언트 | Axios |
| 그래프 시각화 | D3.js / custom SVG |
| 아이콘 | Lucide React |

### 인프라
| 구성 요소 | 기술 |
|-----------|------|
| 컨테이너화 | Docker |
| 빌드 | Google Cloud Build |
| 배포 | Google Cloud Run |
| 이미지 레지스트리 | Artifact Registry (asia-northeast3) |
| 프록시 | nginx (frontend → backend) |

---

## 4. 아키텍처

```
사용자 (Browser / Mobile)
        │
        ▼
┌──────────────────┐
│  Cloud Run       │
│  (Frontend)      │  ← React SPA + nginx
│  :8080           │
└────────┬─────────┘
         │ /api/* → proxy
         ▼
┌──────────────────┐        ┌──────────────┐
│  Cloud Run       │◄──────►│  Cloud SQL   │
│  (Backend)       │        │  PostgreSQL  │
│  :8000 FastAPI   │        └──────────────┘
└────────┬─────────┘
         │
    ┌────┴────────────────┐
    │                     │
    ▼                     ▼
┌──────────┐        ┌──────────────┐
│ Neo4j    │        │ Gemini API   │
│ Aura     │        │ (AI 과제생성) │
└──────────┘        └──────────────┘
```

---

## 5. 계정 정보


| 역할 | 이름 | 이메일 |
|------|------|--------|
| 관리자 | 관리자 | admin@renode.io |
| 강사1 | 선생1 | teacher1@renode.io |
| 강사2 | 선생2 | teacher2@renode.io |
| 학생1 | 학생1 | student1@renode.io |
| 학생2 | 학생2 | student2@renode.io |
| 학생3 | 학생3 | student3@renode.io |
| 학생4 | 학생4 | student4@renode.io |
| 매니저 | 매니저1 | manager1@renode.io |

---

## 6. 강의 목록

### 선생1 담당 (student1, student2 수강)
| 강의 | 개념 노드 |
|------|-----------|
| Python 프로그래밍: 문법과 알고리즘 | 35개 |
| Java 프로그래밍: 객체지향과 핵심 개념 | 26개 |
| C 언어 프로그래밍: 기초부터 시스템까지 | 26개 |
| C++ 프로그래밍: 객체지향과 현대 C++ | 26개 |
| SQL과 데이터베이스: 기초부터 심화까지 | 24개 |
| 자료구조: 핵심 개념과 구현 | 23개 |

### 선생2 담당 (student3, student4 수강)
| 강의 | 개념 노드 |
|------|-----------|
| 컴퓨터 네트워크: 프로토콜과 인터넷 구조 | 23개 |
| 운영체제: 프로세스, 메모리, 파일시스템 | 23개 |
| 알고리즘: 설계와 분석 | 25개 |
| 컴퓨터 구조: CPU, 메모리, 명령어 | 20개 |

---

## 7. 로컬 개발 환경

### 요구사항
- Python 3.11+
- Node.js 18+
- PostgreSQL 접근 가능 (또는 Cloud SQL)
- Neo4j 인스턴스

### 백엔드 실행
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### 시드 데이터
```bash
pip install psycopg2-binary neo4j python-dotenv bcrypt
python scripts/seed.py
```

---

## 8. 환경 변수

`.env` 파일 (루트 디렉토리):

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname?ssl=disable

# Neo4j
NEO4J_URI=neo4j+s://xxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# Auth
SECRET_KEY=your-secret-key

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# GCS
GCS_BUCKET_NAME=your-bucket-name

# App
DEBUG=false
```

---

## 9. 배포

### Google Cloud Build + Cloud Run

```bash
# 백엔드 빌드 & 배포
gcloud builds submit backend/ \
  --tag asia-northeast3-docker.pkg.dev/PROJECT_ID/revmap/backend:latest

gcloud run deploy renode-backend \
  --image asia-northeast3-docker.pkg.dev/PROJECT_ID/revmap/backend:latest \
  --region asia-northeast3 \
  --set-env-vars "DATABASE_URL=...,GEMINI_API_KEY=..."

# 프론트엔드 빌드 & 배포
gcloud builds submit frontend/ \
  --tag asia-northeast3-docker.pkg.dev/PROJECT_ID/revmap/frontend:latest

gcloud run deploy renode-frontend \
  --image asia-northeast3-docker.pkg.dev/PROJECT_ID/revmap/frontend:latest \
  --region asia-northeast3
```

---

## 10. API 명세

### 인증
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 반환) |
| GET | `/api/auth/me` | 내 정보 조회 |

### 강의
| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/lectures` | 강의 목록 | 전체 |
| POST | `/api/lectures` | 강의 생성 | 강사 |
| GET | `/api/lectures/{id}` | 강의 상세 | 전체 |
| POST | `/api/lectures/{id}/upload-text` | 텍스트 업로드 | 강사 |
| GET | `/api/lectures/{id}/students` | 수강생 목록 | 강사 |

### 과제
| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/lectures/{id}/assignments/generate` | AI 과제 생성 | 학생 |
| GET | `/api/lectures/{id}/assignments` | 내 과제 목록 | 학생 |
| POST | `/api/assignments/{id}/submit` | 답안 제출 | 학생 |
| GET | `/api/lectures/{id}/instructor/students` | 수강생 과제 현황 | 강사 |

### 그래프
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/lectures/{id}/generate-graph` | 그래프 생성 |
| GET | `/api/lectures/{id}/graph` | 그래프 조회 |

### 분석
| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/analytics/instructors` | 전체 강사 분석 | 매니저 |
| GET | `/api/analytics/lectures/{id}` | 강의 참여율 | 매니저 |
| GET | `/api/analytics/lectures/{id}/students` | 학생별 참여도 | 매니저 |
