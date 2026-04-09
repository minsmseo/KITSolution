"""
Add CS lectures: SQL/DB, 자료구조, 컴퓨터 네트워크, 운영체제, 알고리즘
"""
import os, uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

import psycopg2
from neo4j import GraphDatabase

DB_URL    = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://").replace("?ssl=disable", "")
NEO4J_URI = os.environ["NEO4J_URI"]
NEO4J_USER = os.environ["NEO4J_USER"]
NEO4J_PASS = os.environ["NEO4J_PASSWORD"]

INSTRUCTOR_ID = "b637a105-d5b4-4605-8f8c-1ebe72246fdb"
STUDENT_IDS   = ["27375e0a-541b-48e4-9aea-68a227e224f5", "ae5e07a0-ad3f-47ae-8aed-50a7b067c8db"]

def new_id(): return str(uuid.uuid4())
def now(): return datetime.utcnow()

LECTURES = [
    # ──────────────────────────────────────────────────────
    {
        "title": "SQL과 데이터베이스: 기초부터 심화까지",
        "description": "관계형 DB 개념, SQL 문법(DDL/DML/DCL), 조인, 인덱스, 트랜잭션, 정규화, 실행 계획까지 실무 DB 핵심을 다룹니다.",
        "text": "SQL DDL DML DCL SELECT INSERT UPDATE DELETE JOIN INNER LEFT RIGHT OUTER INDEX 인덱스 트랜잭션 ACID 정규화 1NF 2NF 3NF BCNF 기본키 외래키 뷰 서브쿼리 집계함수 GROUP BY HAVING ORDER BY 실행계획",
        "nodes": [
            {"id": "rdb",          "label": "관계형 데이터베이스",  "type": "Topic",      "description": "테이블 기반의 데이터 관리 시스템"},
            {"id": "sql",          "label": "SQL",                 "type": "Topic",      "description": "구조적 질의 언어"},
            {"id": "ddl",          "label": "DDL",                 "type": "Concept",    "description": "CREATE TABLE, ALTER, DROP 등 스키마 정의"},
            {"id": "dml",          "label": "DML",                 "type": "Concept",    "description": "SELECT, INSERT, UPDATE, DELETE 데이터 조작"},
            {"id": "dcl",          "label": "DCL/TCL",             "type": "Concept",    "description": "GRANT, REVOKE, COMMIT, ROLLBACK"},
            {"id": "select",       "label": "SELECT",              "type": "Definition", "description": "데이터 조회 핵심 명령어"},
            {"id": "where",        "label": "WHERE / 조건절",      "type": "Concept",    "description": "행 필터링 조건 지정"},
            {"id": "join",         "label": "JOIN",                "type": "Concept",    "description": "두 테이블을 연결하는 연산"},
            {"id": "inner_join",   "label": "INNER JOIN",          "type": "Definition", "description": "교집합 행만 반환"},
            {"id": "outer_join",   "label": "OUTER JOIN",          "type": "Definition", "description": "LEFT/RIGHT/FULL, 불일치 행 포함"},
            {"id": "subquery",     "label": "서브쿼리",            "type": "Concept",    "description": "쿼리 안의 쿼리, 스칼라/인라인/중첩"},
            {"id": "agg_func",     "label": "집계 함수",           "type": "Concept",    "description": "COUNT, SUM, AVG, MAX, MIN"},
            {"id": "group_by",     "label": "GROUP BY / HAVING",   "type": "Concept",    "description": "그룹화 및 그룹 조건 필터"},
            {"id": "index",        "label": "인덱스(Index)",       "type": "Concept",    "description": "조회 속도 향상을 위한 B-Tree 구조"},
            {"id": "transaction",  "label": "트랜잭션",            "type": "Concept",    "description": "원자적으로 처리되는 작업 단위"},
            {"id": "acid",         "label": "ACID",                "type": "Concept",    "description": "원자성/일관성/격리성/지속성"},
            {"id": "isolation",    "label": "격리 수준",           "type": "Concept",    "description": "READ UNCOMMITTED ~ SERIALIZABLE"},
            {"id": "normalization","label": "정규화",              "type": "Concept",    "description": "중복 제거·이상 방지를 위한 설계 기법"},
            {"id": "1nf",          "label": "1NF ~ 3NF / BCNF",   "type": "Definition", "description": "함수 종속성 기반 정규 형식"},
            {"id": "pk_fk",        "label": "기본키 / 외래키",     "type": "Concept",    "description": "무결성 제약조건, 참조 무결성"},
            {"id": "view",         "label": "뷰(View)",            "type": "Concept",    "description": "가상 테이블, 보안·재사용성 제공"},
            {"id": "stored_proc",  "label": "저장 프로시저",       "type": "Concept",    "description": "DB 서버에 저장되는 로직 단위"},
            {"id": "exec_plan",    "label": "실행 계획(EXPLAIN)",  "type": "Concept",    "description": "쿼리 최적화기의 처리 경로 분석"},
            {"id": "nosql",        "label": "NoSQL",               "type": "Topic",      "description": "비관계형 DB: 문서/키값/그래프/컬럼"},
        ],
        "edges": [
            {"source": "rdb",          "target": "sql",          "relation": "PART_OF"},
            {"source": "sql",          "target": "ddl",          "relation": "PART_OF"},
            {"source": "sql",          "target": "dml",          "relation": "PART_OF"},
            {"source": "sql",          "target": "dcl",          "relation": "PART_OF"},
            {"source": "dml",          "target": "select",       "relation": "EXPLAINS"},
            {"source": "select",       "target": "where",        "relation": "RELATES_TO"},
            {"source": "select",       "target": "join",         "relation": "RELATES_TO"},
            {"source": "select",       "target": "agg_func",     "relation": "RELATES_TO"},
            {"source": "select",       "target": "subquery",     "relation": "RELATES_TO"},
            {"source": "join",         "target": "inner_join",   "relation": "EXPLAINS"},
            {"source": "join",         "target": "outer_join",   "relation": "EXPLAINS"},
            {"source": "agg_func",     "target": "group_by",     "relation": "PREREQUISITE_OF"},
            {"source": "rdb",          "target": "index",        "relation": "PART_OF"},
            {"source": "index",        "target": "exec_plan",    "relation": "RELATES_TO"},
            {"source": "rdb",          "target": "transaction",  "relation": "PART_OF"},
            {"source": "transaction",  "target": "acid",         "relation": "EXPLAINS"},
            {"source": "acid",         "target": "isolation",    "relation": "EXPLAINS"},
            {"source": "rdb",          "target": "normalization","relation": "PART_OF"},
            {"source": "normalization","target": "1nf",          "relation": "EXPLAINS"},
            {"source": "normalization","target": "pk_fk",        "relation": "PREREQUISITE_OF"},
            {"source": "rdb",          "target": "view",         "relation": "PART_OF"},
            {"source": "rdb",          "target": "stored_proc",  "relation": "PART_OF"},
            {"source": "rdb",          "target": "nosql",        "relation": "RELATES_TO"},
            {"source": "pk_fk",        "target": "join",         "relation": "PREREQUISITE_OF"},
        ],
    },
    # ──────────────────────────────────────────────────────
    {
        "title": "자료구조: 핵심 개념과 구현",
        "description": "배열, 연결리스트, 스택, 큐, 트리, 힙, 해시, 그래프까지 필수 자료구조의 원리와 시간복잡도를 다룹니다.",
        "text": "배열 연결리스트 스택 큐 데크 트리 이진트리 BST AVL 레드블랙트리 힙 우선순위큐 해시테이블 그래프 인접행렬 인접리스트 시간복잡도 공간복잡도 빅오",
        "nodes": [
            {"id": "ds",           "label": "자료구조",            "type": "Topic",      "description": "데이터를 효율적으로 저장·관리하는 구조"},
            {"id": "array",        "label": "배열(Array)",         "type": "Definition", "description": "연속 메모리, O(1) 접근, 고정 크기"},
            {"id": "dynamic_arr",  "label": "동적 배열",           "type": "Definition", "description": "크기 자동 조정 배열 (vector, ArrayList)"},
            {"id": "linked_list",  "label": "연결 리스트",         "type": "Definition", "description": "노드+포인터, 삽입/삭제 O(1), 탐색 O(n)"},
            {"id": "doubly_ll",    "label": "이중 연결 리스트",    "type": "Definition", "description": "prev/next 포인터, 양방향 순회"},
            {"id": "stack",        "label": "스택(Stack)",         "type": "Definition", "description": "LIFO, push/pop O(1)"},
            {"id": "queue",        "label": "큐(Queue)",           "type": "Definition", "description": "FIFO, enqueue/dequeue O(1)"},
            {"id": "deque",        "label": "덱(Deque)",           "type": "Definition", "description": "양쪽 삽입/삭제 가능한 큐"},
            {"id": "tree",         "label": "트리(Tree)",          "type": "Concept",    "description": "계층 구조, 루트·부모·자식·리프 노드"},
            {"id": "binary_tree",  "label": "이진 트리",           "type": "Definition", "description": "자식이 최대 2개인 트리"},
            {"id": "bst",          "label": "이진 탐색 트리(BST)", "type": "Definition", "description": "왼<루트<오른 순서, 탐색 O(log n)~O(n)"},
            {"id": "avl",          "label": "AVL 트리",            "type": "Definition", "description": "높이 균형 유지, 탐색 항상 O(log n)"},
            {"id": "rb_tree",      "label": "레드-블랙 트리",      "type": "Definition", "description": "색 규칙으로 균형, Java TreeMap 구현"},
            {"id": "heap",         "label": "힙(Heap)",            "type": "Definition", "description": "완전 이진 트리, 최대/최소힙"},
            {"id": "priority_q",   "label": "우선순위 큐",         "type": "Concept",    "description": "힙으로 구현, 삽입/삭제 O(log n)"},
            {"id": "hash_table",   "label": "해시 테이블",         "type": "Definition", "description": "해시 함수로 O(1) 평균 탐색"},
            {"id": "collision",    "label": "충돌 해결",           "type": "Concept",    "description": "체이닝(Chaining), 개방 주소법(Open Addressing)"},
            {"id": "graph",        "label": "그래프(Graph)",       "type": "Concept",    "description": "정점(V)과 간선(E), 방향/무방향/가중치"},
            {"id": "adj_matrix",   "label": "인접 행렬",           "type": "Definition", "description": "V×V 행렬, 간선 확인 O(1), 공간 O(V²)"},
            {"id": "adj_list",     "label": "인접 리스트",         "type": "Definition", "description": "각 정점의 이웃 리스트, 공간 O(V+E)"},
            {"id": "big_o",        "label": "시간/공간 복잡도",    "type": "Concept",    "description": "Big-O 표기법으로 알고리즘 효율 분석"},
            {"id": "trie",         "label": "트라이(Trie)",        "type": "Definition", "description": "문자열 접두사 탐색 트리, O(L) 탐색"},
            {"id": "segment_tree", "label": "세그먼트 트리",       "type": "Definition", "description": "구간 쿼리 O(log n), 범위 합/최솟값"},
        ],
        "edges": [
            {"source": "ds",          "target": "array",        "relation": "PART_OF"},
            {"source": "ds",          "target": "linked_list",  "relation": "PART_OF"},
            {"source": "ds",          "target": "stack",        "relation": "PART_OF"},
            {"source": "ds",          "target": "queue",        "relation": "PART_OF"},
            {"source": "ds",          "target": "tree",         "relation": "PART_OF"},
            {"source": "ds",          "target": "hash_table",   "relation": "PART_OF"},
            {"source": "ds",          "target": "graph",        "relation": "PART_OF"},
            {"source": "array",       "target": "dynamic_arr",  "relation": "RELATES_TO"},
            {"source": "linked_list", "target": "doubly_ll",    "relation": "RELATES_TO"},
            {"source": "linked_list", "target": "stack",        "relation": "EXAMPLE_OF"},
            {"source": "linked_list", "target": "queue",        "relation": "EXAMPLE_OF"},
            {"source": "queue",       "target": "deque",        "relation": "RELATES_TO"},
            {"source": "tree",        "target": "binary_tree",  "relation": "EXPLAINS"},
            {"source": "binary_tree", "target": "bst",          "relation": "RELATES_TO"},
            {"source": "bst",         "target": "avl",          "relation": "RELATES_TO"},
            {"source": "bst",         "target": "rb_tree",      "relation": "RELATES_TO"},
            {"source": "tree",        "target": "heap",         "relation": "RELATES_TO"},
            {"source": "heap",        "target": "priority_q",   "relation": "EXAMPLE_OF"},
            {"source": "hash_table",  "target": "collision",    "relation": "RELATES_TO"},
            {"source": "graph",       "target": "adj_matrix",   "relation": "EXPLAINS"},
            {"source": "graph",       "target": "adj_list",     "relation": "EXPLAINS"},
            {"source": "stack",       "target": "big_o",        "relation": "RELATES_TO"},
            {"source": "tree",        "target": "trie",         "relation": "RELATES_TO"},
            {"source": "tree",        "target": "segment_tree", "relation": "RELATES_TO"},
            {"source": "big_o",       "target": "hash_table",   "relation": "RELATES_TO"},
        ],
    },
    # ──────────────────────────────────────────────────────
    {
        "title": "컴퓨터 네트워크: 프로토콜과 인터넷 구조",
        "description": "OSI 7계층, TCP/IP, HTTP/HTTPS, DNS, 라우팅, 소켓 프로그래밍까지 네트워크 전반을 다룹니다.",
        "text": "OSI 7계층 TCP IP UDP HTTP HTTPS DNS 라우팅 스위칭 IP주소 서브넷 NAT 소켓 3way handshake TLS SSL 방화벽 로드밸런서 CDN",
        "nodes": [
            {"id": "network",      "label": "컴퓨터 네트워크",    "type": "Topic",      "description": "컴퓨터 간 데이터 통신 시스템"},
            {"id": "osi",          "label": "OSI 7계층",          "type": "Concept",    "description": "물리-데이터링크-네트워크-전송-세션-표현-응용"},
            {"id": "phy_layer",    "label": "물리 계층(L1)",      "type": "Definition", "description": "비트 신호 전송, 케이블·허브·리피터"},
            {"id": "data_link",    "label": "데이터링크 계층(L2)","type": "Definition", "description": "프레임 전송, MAC 주소, 스위치"},
            {"id": "network_l",    "label": "네트워크 계층(L3)",  "type": "Definition", "description": "IP 주소·라우팅, 라우터"},
            {"id": "transport",    "label": "전송 계층(L4)",      "type": "Definition", "description": "TCP/UDP, 포트, 신뢰성·흐름 제어"},
            {"id": "app_layer",    "label": "응용 계층(L7)",      "type": "Definition", "description": "HTTP, FTP, DNS, SMTP 등 응용 프로토콜"},
            {"id": "tcp",          "label": "TCP",                "type": "Concept",    "description": "연결 지향, 신뢰성 전송, 3-way handshake"},
            {"id": "handshake",    "label": "3-Way Handshake",    "type": "Concept",    "description": "SYN → SYN-ACK → ACK 연결 수립"},
            {"id": "udp",          "label": "UDP",                "type": "Concept",    "description": "비연결, 빠른 전송, 스트리밍·게임에 적합"},
            {"id": "ip",           "label": "IP 주소",            "type": "Concept",    "description": "IPv4(32비트), IPv6(128비트) 네트워크 주소"},
            {"id": "subnet",       "label": "서브넷 / CIDR",      "type": "Concept",    "description": "네트워크 분할, /24 = 256개 주소"},
            {"id": "nat",          "label": "NAT",                "type": "Concept",    "description": "사설IP → 공인IP 주소 변환"},
            {"id": "routing",      "label": "라우팅",             "type": "Concept",    "description": "최적 경로 선택, RIP·OSPF·BGP"},
            {"id": "http",         "label": "HTTP / HTTPS",       "type": "Concept",    "description": "웹 통신 프로토콜, 요청/응답 구조"},
            {"id": "http_method",  "label": "HTTP 메서드",        "type": "Definition", "description": "GET·POST·PUT·DELETE·PATCH"},
            {"id": "status_code",  "label": "HTTP 상태 코드",     "type": "Definition", "description": "200·301·400·401·403·404·500 등"},
            {"id": "tls",          "label": "TLS / SSL",          "type": "Concept",    "description": "공개키 암호화 기반 보안 통신"},
            {"id": "dns",          "label": "DNS",                "type": "Concept",    "description": "도메인 → IP 주소 변환 시스템"},
            {"id": "socket",       "label": "소켓(Socket)",       "type": "Concept",    "description": "네트워크 통신 엔드포인트 추상화"},
            {"id": "load_balancer","label": "로드 밸런서",        "type": "Concept",    "description": "트래픽을 여러 서버에 분산"},
            {"id": "cdn",          "label": "CDN",                "type": "Concept",    "description": "지리적으로 분산된 콘텐츠 전송 네트워크"},
            {"id": "firewall",     "label": "방화벽",             "type": "Concept",    "description": "패킷 필터링으로 네트워크 보안"},
        ],
        "edges": [
            {"source": "network",     "target": "osi",          "relation": "PART_OF"},
            {"source": "osi",         "target": "phy_layer",    "relation": "EXPLAINS"},
            {"source": "osi",         "target": "data_link",    "relation": "EXPLAINS"},
            {"source": "osi",         "target": "network_l",    "relation": "EXPLAINS"},
            {"source": "osi",         "target": "transport",    "relation": "EXPLAINS"},
            {"source": "osi",         "target": "app_layer",    "relation": "EXPLAINS"},
            {"source": "transport",   "target": "tcp",          "relation": "EXPLAINS"},
            {"source": "transport",   "target": "udp",          "relation": "EXPLAINS"},
            {"source": "tcp",         "target": "handshake",    "relation": "EXPLAINS"},
            {"source": "network_l",   "target": "ip",           "relation": "EXPLAINS"},
            {"source": "ip",          "target": "subnet",       "relation": "RELATES_TO"},
            {"source": "ip",          "target": "nat",          "relation": "RELATES_TO"},
            {"source": "network_l",   "target": "routing",      "relation": "RELATES_TO"},
            {"source": "app_layer",   "target": "http",         "relation": "EXPLAINS"},
            {"source": "app_layer",   "target": "dns",          "relation": "EXPLAINS"},
            {"source": "http",        "target": "http_method",  "relation": "EXPLAINS"},
            {"source": "http",        "target": "status_code",  "relation": "EXPLAINS"},
            {"source": "http",        "target": "tls",          "relation": "RELATES_TO"},
            {"source": "tcp",         "target": "socket",       "relation": "PREREQUISITE_OF"},
            {"source": "network",     "target": "load_balancer","relation": "RELATES_TO"},
            {"source": "network",     "target": "cdn",          "relation": "RELATES_TO"},
            {"source": "network",     "target": "firewall",     "relation": "RELATES_TO"},
            {"source": "data_link",   "target": "nat",          "relation": "RELATES_TO"},
        ],
    },
    # ──────────────────────────────────────────────────────
    {
        "title": "운영체제: 프로세스, 메모리, 파일시스템",
        "description": "프로세스·스레드, CPU 스케줄링, 메모리 관리(가상메모리·페이징), 파일시스템, 동기화, 교착상태까지 OS 핵심 개념을 다룹니다.",
        "text": "프로세스 스레드 CPU 스케줄링 FCFS SJF RR 우선순위 가상메모리 페이징 세그멘테이션 페이지교체 LRU FIFO 교착상태 데드락 세마포어 뮤텍스 임계구역 파일시스템 inode 인터럽트 시스템콜",
        "nodes": [
            {"id": "os",           "label": "운영체제(OS)",        "type": "Topic",      "description": "하드웨어와 응용 소프트웨어 사이의 핵심 소프트웨어"},
            {"id": "process",      "label": "프로세스",            "type": "Concept",    "description": "실행 중인 프로그램, PCB로 관리"},
            {"id": "thread",       "label": "스레드",              "type": "Concept",    "description": "프로세스 내 실행 흐름 단위, 메모리 공유"},
            {"id": "pcb",          "label": "PCB",                 "type": "Definition", "description": "프로세스 제어 블록, 상태·레지스터·메모리 정보"},
            {"id": "context_sw",   "label": "컨텍스트 스위칭",    "type": "Concept",    "description": "CPU 실행 프로세스를 전환하는 과정"},
            {"id": "scheduling",   "label": "CPU 스케줄링",        "type": "Concept",    "description": "어떤 프로세스에 CPU를 할당할지 결정"},
            {"id": "fcfs",         "label": "FCFS",                "type": "Definition", "description": "선입선출, 비선점, 호위 효과 발생"},
            {"id": "sjf",          "label": "SJF / SRTF",         "type": "Definition", "description": "최단 작업 우선, 평균 대기시간 최소"},
            {"id": "rr",           "label": "라운드 로빈(RR)",    "type": "Definition", "description": "타임 퀀텀 기반 선점, 응답성 좋음"},
            {"id": "virtual_mem",  "label": "가상 메모리",        "type": "Concept",    "description": "물리 메모리보다 큰 주소 공간 제공"},
            {"id": "paging",       "label": "페이징",             "type": "Concept",    "description": "메모리를 고정 크기 페이지로 분할"},
            {"id": "page_table",   "label": "페이지 테이블",      "type": "Definition", "description": "가상→물리 주소 변환 자료구조"},
            {"id": "page_fault",   "label": "페이지 폴트",        "type": "Concept",    "description": "페이지가 물리 메모리에 없을 때 발생"},
            {"id": "page_replace", "label": "페이지 교체 알고리즘","type":"Concept",    "description": "FIFO·LRU·LFU·Optimal"},
            {"id": "segmentation", "label": "세그멘테이션",       "type": "Concept",    "description": "가변 크기 세그먼트로 분할, 외부 단편화"},
            {"id": "deadlock",     "label": "교착상태(Deadlock)",  "type": "Concept",    "description": "4가지 조건: 상호배제·점유대기·비선점·순환대기"},
            {"id": "semaphore",    "label": "세마포어",           "type": "Definition", "description": "P/V 연산으로 임계구역 보호"},
            {"id": "mutex",        "label": "뮤텍스",             "type": "Definition", "description": "이진 세마포어, lock/unlock"},
            {"id": "critical_sec", "label": "임계구역",           "type": "Concept",    "description": "동시 접근 시 레이스 컨디션 발생 영역"},
            {"id": "filesystem",   "label": "파일시스템",         "type": "Concept",    "description": "파일 저장·관리 구조 (ext4, NTFS, FAT32)"},
            {"id": "inode",        "label": "inode",              "type": "Definition", "description": "파일 메타데이터 저장 구조 (Unix)"},
            {"id": "interrupt",    "label": "인터럽트",           "type": "Concept",    "description": "하드웨어/소프트웨어 이벤트로 CPU 흐름 전환"},
            {"id": "syscall",      "label": "시스템 콜",          "type": "Concept",    "description": "사용자 모드 → 커널 모드 전환 인터페이스"},
        ],
        "edges": [
            {"source": "os",          "target": "process",      "relation": "PART_OF"},
            {"source": "os",          "target": "virtual_mem",  "relation": "PART_OF"},
            {"source": "os",          "target": "filesystem",   "relation": "PART_OF"},
            {"source": "os",          "target": "scheduling",   "relation": "PART_OF"},
            {"source": "process",     "target": "thread",       "relation": "RELATES_TO"},
            {"source": "process",     "target": "pcb",          "relation": "EXPLAINS"},
            {"source": "process",     "target": "context_sw",   "relation": "RELATES_TO"},
            {"source": "scheduling",  "target": "context_sw",   "relation": "PREREQUISITE_OF"},
            {"source": "scheduling",  "target": "fcfs",         "relation": "EXPLAINS"},
            {"source": "scheduling",  "target": "sjf",          "relation": "EXPLAINS"},
            {"source": "scheduling",  "target": "rr",           "relation": "EXPLAINS"},
            {"source": "virtual_mem", "target": "paging",       "relation": "EXPLAINS"},
            {"source": "virtual_mem", "target": "segmentation", "relation": "EXPLAINS"},
            {"source": "paging",      "target": "page_table",   "relation": "EXPLAINS"},
            {"source": "paging",      "target": "page_fault",   "relation": "RELATES_TO"},
            {"source": "page_fault",  "target": "page_replace", "relation": "PREREQUISITE_OF"},
            {"source": "thread",      "target": "critical_sec", "relation": "RELATES_TO"},
            {"source": "critical_sec","target": "semaphore",    "relation": "EXPLAINS"},
            {"source": "critical_sec","target": "mutex",        "relation": "EXPLAINS"},
            {"source": "critical_sec","target": "deadlock",     "relation": "RELATES_TO"},
            {"source": "filesystem",  "target": "inode",        "relation": "EXPLAINS"},
            {"source": "os",          "target": "interrupt",    "relation": "PART_OF"},
            {"source": "os",          "target": "syscall",      "relation": "PART_OF"},
            {"source": "interrupt",   "target": "syscall",      "relation": "RELATES_TO"},
        ],
    },
    # ──────────────────────────────────────────────────────
    {
        "title": "알고리즘: 설계와 분석",
        "description": "정렬·탐색·그래프·동적 프로그래밍·탐욕·분할정복 등 핵심 알고리즘의 설계 원리와 복잡도 분석을 다룹니다.",
        "text": "정렬 탐색 BFS DFS 다익스트라 벨만포드 플로이드 크루스칼 프림 동적프로그래밍 탐욕 분할정복 백트래킹 투포인터 슬라이딩윈도우 이진탐색 KMP",
        "nodes": [
            {"id": "algo",         "label": "알고리즘",           "type": "Topic",      "description": "문제 해결을 위한 단계적 절차"},
            {"id": "complexity",   "label": "시간·공간 복잡도",   "type": "Concept",    "description": "Big-O, Ω, Θ 표기법"},
            {"id": "sort",         "label": "정렬 알고리즘",      "type": "Topic",      "description": "데이터를 순서대로 나열"},
            {"id": "bubble",       "label": "버블 정렬",          "type": "Definition", "description": "인접 비교·교환 O(n²)"},
            {"id": "merge_sort",   "label": "합병 정렬",          "type": "Definition", "description": "분할정복 O(n log n), 안정 정렬"},
            {"id": "quick_sort",   "label": "퀵 정렬",            "type": "Definition", "description": "피벗 기준 분할, 평균 O(n log n)"},
            {"id": "heap_sort",    "label": "힙 정렬",            "type": "Definition", "description": "힙 자료구조 활용 O(n log n)"},
            {"id": "counting_sort","label": "계수 정렬",          "type": "Definition", "description": "정수 범위 제한 시 O(n+k)"},
            {"id": "binary_search","label": "이진 탐색",          "type": "Concept",    "description": "정렬 배열에서 O(log n) 탐색"},
            {"id": "bfs",          "label": "BFS",                "type": "Concept",    "description": "너비 우선 탐색, 큐, 최단 경로"},
            {"id": "dfs",          "label": "DFS",                "type": "Concept",    "description": "깊이 우선 탐색, 스택/재귀"},
            {"id": "dijkstra",     "label": "다익스트라",         "type": "Concept",    "description": "음수 없는 최단경로, O((V+E)log V)"},
            {"id": "bellman_ford", "label": "벨만-포드",          "type": "Concept",    "description": "음수 가중치 최단경로, O(VE)"},
            {"id": "floyd",        "label": "플로이드-워셜",      "type": "Concept",    "description": "모든 쌍 최단경로 O(V³)"},
            {"id": "kruskal",      "label": "크루스칼",           "type": "Concept",    "description": "최소 신장 트리, Union-Find 활용"},
            {"id": "prim",         "label": "프림",               "type": "Concept",    "description": "최소 신장 트리, 우선순위 큐 활용"},
            {"id": "dp",           "label": "동적 프로그래밍(DP)","type": "Concept",    "description": "최적 부분 구조 + 중복 부분 문제"},
            {"id": "memoization",  "label": "메모이제이션",       "type": "Definition", "description": "하향식 DP, 계산 결과 캐싱"},
            {"id": "tabulation",   "label": "타뷸레이션",         "type": "Definition", "description": "상향식 DP, 배열 순차 채우기"},
            {"id": "greedy",       "label": "탐욕 알고리즘",      "type": "Concept",    "description": "매 단계 지역 최적 선택"},
            {"id": "divide_conq",  "label": "분할 정복",          "type": "Concept",    "description": "분할→정복→합병, 재귀 적용"},
            {"id": "backtracking", "label": "백트래킹",           "type": "Concept",    "description": "가지치기로 탐색 공간 축소"},
            {"id": "two_ptr",      "label": "투 포인터",          "type": "Concept",    "description": "두 인덱스로 O(n) 구간 탐색"},
            {"id": "sliding_win",  "label": "슬라이딩 윈도우",   "type": "Concept",    "description": "고정/가변 윈도우로 부분 배열 최적화"},
            {"id": "union_find",   "label": "Union-Find",         "type": "Concept",    "description": "서로소 집합, 사이클 탐지에 활용"},
        ],
        "edges": [
            {"source": "algo",        "target": "complexity",   "relation": "PART_OF"},
            {"source": "algo",        "target": "sort",         "relation": "PART_OF"},
            {"source": "algo",        "target": "binary_search","relation": "PART_OF"},
            {"source": "algo",        "target": "bfs",          "relation": "PART_OF"},
            {"source": "algo",        "target": "dfs",          "relation": "PART_OF"},
            {"source": "algo",        "target": "dp",           "relation": "PART_OF"},
            {"source": "algo",        "target": "greedy",       "relation": "PART_OF"},
            {"source": "algo",        "target": "divide_conq",  "relation": "PART_OF"},
            {"source": "algo",        "target": "backtracking", "relation": "PART_OF"},
            {"source": "sort",        "target": "bubble",       "relation": "EXPLAINS"},
            {"source": "sort",        "target": "merge_sort",   "relation": "EXPLAINS"},
            {"source": "sort",        "target": "quick_sort",   "relation": "EXPLAINS"},
            {"source": "sort",        "target": "heap_sort",    "relation": "EXPLAINS"},
            {"source": "sort",        "target": "counting_sort","relation": "EXPLAINS"},
            {"source": "divide_conq", "target": "merge_sort",   "relation": "EXAMPLE_OF"},
            {"source": "divide_conq", "target": "quick_sort",   "relation": "EXAMPLE_OF"},
            {"source": "divide_conq", "target": "binary_search","relation": "EXAMPLE_OF"},
            {"source": "bfs",         "target": "dijkstra",     "relation": "PREREQUISITE_OF"},
            {"source": "dijkstra",    "target": "bellman_ford", "relation": "RELATES_TO"},
            {"source": "dijkstra",    "target": "floyd",        "relation": "RELATES_TO"},
            {"source": "greedy",      "target": "kruskal",      "relation": "EXAMPLE_OF"},
            {"source": "greedy",      "target": "prim",         "relation": "EXAMPLE_OF"},
            {"source": "kruskal",     "target": "union_find",   "relation": "PREREQUISITE_OF"},
            {"source": "dp",          "target": "memoization",  "relation": "EXPLAINS"},
            {"source": "dp",          "target": "tabulation",   "relation": "EXPLAINS"},
            {"source": "backtracking","target": "dfs",          "relation": "RELATES_TO"},
            {"source": "two_ptr",     "target": "sliding_win",  "relation": "RELATES_TO"},
            {"source": "complexity",  "target": "sort",         "relation": "RELATES_TO"},
        ],
    },
    # ──────────────────────────────────────────────────────
    {
        "title": "컴퓨터 구조: CPU, 메모리, 명령어",
        "description": "CPU 구조, 명령어 집합(ISA), 파이프라이닝, 캐시 메모리, 메모리 계층, 병렬 처리 등 컴퓨터 하드웨어 동작 원리를 다룹니다.",
        "text": "CPU ALU 레지스터 명령어 ISA RISC CISC 파이프라인 캐시 L1 L2 L3 DRAM 메모리계층 가상주소 TLB 병렬처리 멀티코어 하이퍼스레딩 버스",
        "nodes": [
            {"id": "ca",           "label": "컴퓨터 구조",        "type": "Topic",      "description": "컴퓨터 하드웨어 구성 및 동작 원리"},
            {"id": "cpu",          "label": "CPU",                "type": "Concept",    "description": "중앙 처리 장치, 명령어 실행의 핵심"},
            {"id": "alu",          "label": "ALU",                "type": "Definition", "description": "산술·논리 연산 수행 유닛"},
            {"id": "register",     "label": "레지스터",           "type": "Definition", "description": "CPU 내부 초고속 임시 저장소"},
            {"id": "control_unit", "label": "제어 장치(CU)",      "type": "Definition", "description": "명령어 해석·실행 순서 제어"},
            {"id": "isa",          "label": "명령어 집합(ISA)",   "type": "Concept",    "description": "CPU가 이해하는 명령어 체계"},
            {"id": "risc",         "label": "RISC",               "type": "Definition", "description": "단순·고정 길이 명령어, ARM·RISC-V"},
            {"id": "cisc",         "label": "CISC",               "type": "Definition", "description": "복잡·가변 길이 명령어, x86"},
            {"id": "pipeline",     "label": "파이프라이닝",       "type": "Concept",    "description": "명령어를 단계별 중첩 실행, 처리량 향상"},
            {"id": "hazard",       "label": "파이프라인 해저드",  "type": "Concept",    "description": "구조적·데이터·제어 해저드, 스톨 발생"},
            {"id": "cache",        "label": "캐시 메모리",        "type": "Concept",    "description": "CPU와 RAM 사이 고속 임시 저장"},
            {"id": "cache_level",  "label": "L1 / L2 / L3 캐시", "type": "Definition", "description": "계층별 용량·속도 트레이드오프"},
            {"id": "hit_miss",     "label": "캐시 히트/미스",     "type": "Concept",    "description": "지역성 원리 활용, 히트율이 성능 결정"},
            {"id": "mem_hierarchy","label": "메모리 계층",        "type": "Concept",    "description": "레지스터→캐시→DRAM→SSD→HDD"},
            {"id": "dram",         "label": "DRAM / RAM",         "type": "Definition", "description": "주기억장치, 휘발성, 수십 나노초 접근"},
            {"id": "tlb",          "label": "TLB",                "type": "Definition", "description": "페이지 테이블 캐시, 주소 변환 가속"},
            {"id": "bus",          "label": "버스(Bus)",          "type": "Concept",    "description": "데이터·주소·제어 버스로 구성"},
            {"id": "multicore",    "label": "멀티코어 / 병렬처리","type": "Concept",    "description": "여러 코어 동시 실행, Amdahl의 법칙"},
            {"id": "hyperthreading","label":"하이퍼스레딩",       "type": "Definition", "description": "물리 코어 1개를 논리 코어 2개로 사용"},
            {"id": "branch_pred",  "label": "분기 예측",         "type": "Concept",    "description": "조건 분기 결과를 미리 예측, 파이프라인 유지"},
        ],
        "edges": [
            {"source": "ca",          "target": "cpu",          "relation": "PART_OF"},
            {"source": "ca",          "target": "mem_hierarchy","relation": "PART_OF"},
            {"source": "ca",          "target": "bus",          "relation": "PART_OF"},
            {"source": "cpu",         "target": "alu",          "relation": "PART_OF"},
            {"source": "cpu",         "target": "register",     "relation": "PART_OF"},
            {"source": "cpu",         "target": "control_unit", "relation": "PART_OF"},
            {"source": "cpu",         "target": "pipeline",     "relation": "PART_OF"},
            {"source": "cpu",         "target": "isa",          "relation": "RELATES_TO"},
            {"source": "isa",         "target": "risc",         "relation": "EXPLAINS"},
            {"source": "isa",         "target": "cisc",         "relation": "EXPLAINS"},
            {"source": "pipeline",    "target": "hazard",       "relation": "RELATES_TO"},
            {"source": "pipeline",    "target": "branch_pred",  "relation": "RELATES_TO"},
            {"source": "mem_hierarchy","target": "cache",       "relation": "EXPLAINS"},
            {"source": "mem_hierarchy","target": "dram",        "relation": "EXPLAINS"},
            {"source": "mem_hierarchy","target": "register",    "relation": "RELATES_TO"},
            {"source": "cache",       "target": "cache_level",  "relation": "EXPLAINS"},
            {"source": "cache",       "target": "hit_miss",     "relation": "EXPLAINS"},
            {"source": "dram",        "target": "tlb",          "relation": "RELATES_TO"},
            {"source": "cpu",         "target": "multicore",    "relation": "RELATES_TO"},
            {"source": "multicore",   "target": "hyperthreading","relation": "RELATES_TO"},
        ],
    },
]

# ── PostgreSQL insert ────────────────────────────────────
print("Connecting to PostgreSQL...")
conn = psycopg2.connect(DB_URL)
conn.autocommit = False
cur = conn.cursor()

lecture_ids = []
for lec in LECTURES:
    lid = new_id()
    lecture_ids.append(lid)
    cur.execute("""
        INSERT INTO lectures (id, title, description, instructor_id, source_text_gcs_path, graph_status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (lid, lec["title"], lec["description"], INSTRUCTOR_ID,
          f"inline:{lec['text'][:200]}", "processing", now(), now()))
    for sid in STUDENT_IDS:
        cur.execute("""
            INSERT INTO enrollments (id, lecture_id, student_id, enrolled_at)
            VALUES (%s, %s, %s, %s)
        """, (new_id(), lid, sid, now()))
    print(f"  Created: {lec['title']}")

conn.commit()
print("PostgreSQL committed.")

# ── Neo4j insert ─────────────────────────────────────────
print("\nStoring knowledge graphs in Neo4j...")
NEO4J_URI_SSC = NEO4J_URI.replace("neo4j+s://", "neo4j+ssc://")
driver = GraphDatabase.driver(NEO4J_URI_SSC, auth=(NEO4J_USER, NEO4J_PASS))
VALID_REL = {"EXPLAINS", "RELATES_TO", "PREREQUISITE_OF", "PART_OF", "EXAMPLE_OF"}

for lec, lid in zip(LECTURES, lecture_ids):
    with driver.session() as s:
        for node in lec["nodes"]:
            s.run("""
                CREATE (n:KGNode {node_id:$nid, lecture_id:$lid, label:$label, type:$type, description:$desc})
            """, nid=node["id"], lid=lid, label=node["label"],
                 type=node.get("type","Concept"), desc=node.get("description",""))
        for edge in lec["edges"]:
            rel = edge["relation"] if edge["relation"] in VALID_REL else "RELATES_TO"
            s.run(f"""
                MATCH (a:KGNode {{node_id:$src, lecture_id:$lid}})
                MATCH (b:KGNode {{node_id:$tgt, lecture_id:$lid}})
                CREATE (a)-[:{rel}]->(b)
            """, src=edge["source"], tgt=edge["target"], lid=lid)
    cur.execute("UPDATE lectures SET graph_status='completed' WHERE id=%s", (lid,))
    print(f"  Graph: {lec['title']} ({len(lec['nodes'])}노드 {len(lec['edges'])}엣지)")

conn.commit()
driver.close()
cur.close()
conn.close()

print("\n✅ Done!")
for lec, lid in zip(LECTURES, lecture_ids):
    print(f"  [{lid[:8]}] {lec['title']}")
