"""
Seed script: creates users, lectures, knowledge graphs, and enrollments.
Run from project root: python scripts/seed.py
"""
import os, sys, uuid, json, re
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

import psycopg2
import bcrypt as _bcrypt
from neo4j import GraphDatabase

# ── Config ──────────────────────────────────────────────
DB_URL   = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://").replace("?ssl=disable", "")
NEO4J_URI  = os.environ["NEO4J_URI"]
NEO4J_USER = os.environ["NEO4J_USER"]
NEO4J_PASS = os.environ["NEO4J_PASSWORD"]

def hash_pw(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()

def new_id():
    return str(uuid.uuid4())

def now():
    return datetime.utcnow()

def make_user(role, name, email):
    return (new_id(), name, email, hash_pw("1234"), role, now())

# ── Lecture texts ────────────────────────────────────────
PYTHON_TEXT = """
# Python 프로그래밍: 문법과 알고리즘

## 1. 기본 문법

### 변수와 자료형
Python은 동적 타입 언어로, 변수 선언 시 자료형을 명시하지 않아도 됩니다.
- 정수(int): x = 10
- 실수(float): y = 3.14
- 문자열(str): name = "Python"
- 불리언(bool): flag = True
- 리스트(list): nums = [1, 2, 3]
- 딕셔너리(dict): info = {"key": "value"}
- 튜플(tuple): point = (1, 2)
- 집합(set): s = {1, 2, 3}

### 조건문 (if-elif-else)
### 반복문 (for, while)
### 함수 (def), 람다, 데코레이터, 제너레이터
### 클래스와 OOP: 상속, 캡슐화, 다형성, 추상화
### 예외처리 (try-except-finally)
### 리스트 컴프리헨션

## 2. 자료구조
스택, 큐, 연결 리스트, 해시 테이블, 트리, 그래프

## 3. 알고리즘
빅오 표기법, 버블/선택/삽입/합병/퀵 정렬, 순차/이진 탐색,
DFS, BFS, 동적 프로그래밍, 탐욕 알고리즘, 분할 정복, 재귀
"""

JAVA_TEXT = """
# Java 프로그래밍: 객체지향과 핵심 개념

## 1. Java 기초

### JVM과 실행 구조
Java는 JVM(Java Virtual Machine) 위에서 실행되는 플랫폼 독립적 언어입니다.
- 소스 코드(.java) → 컴파일 → 바이트코드(.class) → JVM 실행
- JRE(Java Runtime Environment): JVM + 표준 라이브러리
- JDK(Java Development Kit): JRE + 개발 도구

### 기본 자료형과 참조형
- 기본형(Primitive): int, long, double, float, boolean, char, byte, short
- 참조형(Reference): String, Array, Object (힙 메모리에 저장)
- 박싱(Boxing)/언박싱(Unboxing): int ↔ Integer 자동 변환
- 변수 선언: int x = 10; String name = "Java";

### 연산자와 제어문
- 산술, 비교, 논리, 비트, 삼항 연산자
- if-else, switch-case
- for, while, do-while, enhanced for(for-each)
- break, continue, return

### 배열
int[] arr = new int[5];
int[][] matrix = new int[3][4]; // 2차원 배열
Arrays.sort(arr); // 정렬
System.arraycopy(src, 0, dst, 0, len); // 복사

## 2. 객체지향 프로그래밍 (OOP)

### 클래스와 객체
class Car {
    String model;
    int speed;

    Car(String model) {
        this.model = model;
    }

    void accelerate(int amount) {
        speed += amount;
    }
}
Car myCar = new Car("Tesla");

### 생성자와 this
- 기본 생성자: 매개변수 없음
- 매개변수 생성자: 초기값 설정
- this: 현재 객체 참조
- this(): 같은 클래스의 다른 생성자 호출

### 상속 (Inheritance)
class Animal {
    String name;
    void eat() { System.out.println("eating"); }
}
class Dog extends Animal {
    @Override
    void eat() { System.out.println("Dog eating"); }
    void bark() { System.out.println("Woof!"); }
}
- super: 부모 클래스 참조
- @Override: 메서드 재정의

### 다형성 (Polymorphism)
Animal a = new Dog(); // 업캐스팅
a.eat(); // Dog의 eat() 호출 (동적 바인딩)
Dog d = (Dog) a; // 다운캐스팅

### 추상 클래스와 인터페이스
abstract class Shape {
    abstract double area();
    void print() { System.out.println(area()); }
}

interface Drawable {
    void draw(); // 추상 메서드
    default void show() { System.out.println("showing"); } // 디폴트 메서드
}

class Circle extends Shape implements Drawable {
    double r;
    Circle(double r) { this.r = r; }
    double area() { return Math.PI * r * r; }
    public void draw() { System.out.println("Circle"); }
}

### 캡슐화와 접근 제한자
- private: 클래스 내부만
- protected: 같은 패키지 + 자식 클래스
- public: 모든 클래스
- default(package-private): 같은 패키지만
- getter/setter로 private 필드 접근

## 3. 고급 개념

### 제네릭 (Generics)
List<String> list = new ArrayList<>();
Map<String, Integer> map = new HashMap<>();
// 타입 안전성 보장, 형변환 불필요

### 컬렉션 프레임워크
- List: ArrayList(배열 기반), LinkedList(노드 기반)
- Set: HashSet(순서 없음), TreeSet(정렬), LinkedHashSet(삽입 순서)
- Map: HashMap, TreeMap, LinkedHashMap
- Queue: LinkedList, PriorityQueue, ArrayDeque

### 예외 처리
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println(e.getMessage());
} finally {
    System.out.println("항상 실행");
}
- Checked Exception: 컴파일 시 확인 (IOException, SQLException)
- Unchecked Exception: 런타임 오류 (NullPointerException, ArrayIndexOutOfBoundsException)
- throws, throw 키워드
- 사용자 정의 예외: Exception 상속

### 스레드와 동시성
Thread t = new Thread(() -> System.out.println("thread"));
t.start();
- Runnable, Callable 인터페이스
- synchronized: 상호 배제
- volatile: 메모리 가시성
- wait(), notify(), notifyAll()
- ExecutorService, Future

### 람다와 스트림 (Java 8+)
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.stream()
     .filter(s -> s.length() > 3)
     .map(String::toUpperCase)
     .sorted()
     .forEach(System.out::println);

// 함수형 인터페이스
Function<Integer, Integer> square = x -> x * x;
Predicate<String> isLong = s -> s.length() > 5;
Consumer<String> printer = System.out::println;

### Optional
Optional<String> opt = Optional.ofNullable(getValue());
opt.ifPresent(System.out::println);
String result = opt.orElse("default");

### 가비지 컬렉션
- Mark-and-Sweep 알고리즘
- Young Generation(Eden, Survivor), Old Generation
- Minor GC, Major GC, Full GC
- G1, ZGC, Shenandoah GC
"""

C_TEXT = """
# C 언어 프로그래밍: 기초부터 시스템까지

## 1. C 언어 기초

### C 언어 특징과 구조
C는 1972년 Dennis Ritchie가 개발한 절차적 프로그래밍 언어입니다.
- 컴파일 언어: 소스코드 → 오브젝트 파일 → 링킹 → 실행파일
- 시스템 프로그래밍에 적합 (OS, 드라이버, 임베디드)
- 하드웨어에 가까운 메모리 제어

#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}

### 변수와 자료형
- int: 정수 (4바이트)
- long: 큰 정수 (8바이트)
- float: 단정도 실수 (4바이트)
- double: 배정도 실수 (8바이트)
- char: 문자 (1바이트)
- unsigned: 부호 없는 양의 정수
- void: 타입 없음
- 형변환: (int)3.14, (double)5

### 연산자
- 산술: +, -, *, /, % (나머지)
- 비교: ==, !=, <, >, <=, >=
- 논리: &&, ||, !
- 비트: &, |, ^, ~, <<, >>
- 증감: ++, --
- 삼항: 조건 ? 참 : 거짓
- sizeof: 자료형 크기

### 제어문
if-else, switch-case
for, while, do-while
break, continue, goto(비권장)

## 2. 포인터와 메모리

### 포인터
포인터는 메모리 주소를 저장하는 변수입니다.
int x = 10;
int *p = &x;     // p는 x의 주소를 저장
printf("%d", *p); // 역참조: x의 값 10 출력
*p = 20;         // x의 값을 20으로 변경

- *: 역참조 연산자 (포인터가 가리키는 값)
- &: 주소 연산자 (변수의 메모리 주소)
- NULL 포인터: 0 또는 NULL로 초기화

### 포인터 연산
int arr[] = {1, 2, 3, 4, 5};
int *p = arr;
p++;     // 다음 원소로 이동 (4바이트 이동)
*(p+2)  // arr[2]와 동일

### 포인터와 배열
- 배열명은 첫 번째 원소의 주소
- arr[i] == *(arr + i)
- 함수에 배열 전달 시 포인터로 전달됨

### 이중 포인터
int **pp = &p; // 포인터의 포인터
// 동적 2차원 배열, 문자열 배열에 활용

### 동적 메모리 할당
#include <stdlib.h>
int *arr = (int*)malloc(10 * sizeof(int));  // 힙에 40바이트 할당
int *arr2 = (int*)calloc(10, sizeof(int));  // 0으로 초기화
arr = (int*)realloc(arr, 20 * sizeof(int)); // 크기 변경
free(arr); // 반드시 해제 (메모리 누수 방지)

- malloc: 초기화 없이 할당
- calloc: 0으로 초기화하여 할당
- realloc: 크기 재조정
- free: 메모리 해제
- 메모리 누수(Memory Leak): free 없이 참조 잃어버림
- 댕글링 포인터(Dangling Pointer): free 후 포인터 사용

## 3. 함수

### 함수 정의와 선언
int add(int a, int b) {
    return a + b;
}
// 함수 원형(프로토타입) 선언: 컴파일러에 미리 알림
int add(int a, int b);

### 값에 의한 전달 vs 참조에 의한 전달
void swap_value(int a, int b) { // 복사본 변경, 원본 불변
    int temp = a; a = b; b = temp;
}
void swap_pointer(int *a, int *b) { // 포인터로 원본 변경
    int temp = *a; *a = *b; *b = temp;
}

### 재귀 함수
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

### 함수 포인터
int (*fp)(int, int) = add;
int result = fp(3, 4); // 7
// 콜백 함수, 함수 테이블에 활용

## 4. 구조체와 공용체

### 구조체 (struct)
struct Student {
    char name[50];
    int age;
    double gpa;
};
struct Student s1 = {"김철수", 20, 3.8};
s1.age = 21;

// typedef로 별칭 사용
typedef struct {
    int x, y;
} Point;
Point p = {3, 4};

### 포인터로 구조체 접근
struct Student *ptr = &s1;
ptr->age = 22;  // (*ptr).age = 22 와 동일
// -> 연산자: 구조체 포인터 멤버 접근

### 공용체 (union)
union Data {
    int i;
    float f;
    char str[20];
};
// 모든 멤버가 같은 메모리 공간 공유 (가장 큰 멤버 크기)

### 열거형 (enum)
enum Color { RED, GREEN, BLUE }; // 0, 1, 2
enum Day { MON=1, TUE, WED, THU, FRI, SAT, SUN };

## 5. 배열과 문자열

### 배열
int arr[5] = {1, 2, 3, 4, 5};
// 정적 배열: 스택에 할당, 크기 고정
// 다차원 배열: int matrix[3][4];

### 문자열
char str[] = "Hello";  // 끝에 NULL('\0') 자동 추가
#include <string.h>
strlen(str);         // 길이 (NULL 제외)
strcpy(dst, src);    // 복사 (버퍼 오버플로우 주의)
strncpy(dst, src, n); // 안전한 복사
strcat(dst, src);    // 연결
strcmp(s1, s2);      // 비교 (0이면 같음)
sprintf(buf, "값: %d", x); // 문자열로 포맷

## 6. 파일 입출력

### 파일 처리
FILE *fp = fopen("data.txt", "r"); // r, w, a, rb, wb
if (fp == NULL) { perror("Error"); exit(1); }
fprintf(fp, "Hello %d\\n", 42);
fscanf(fp, "%d", &num);
fgets(line, sizeof(line), fp);
fclose(fp);

### 표준 입출력
printf("출력: %d %f %s\\n", i, f, s);
scanf("%d", &x);
getchar(), putchar()
gets() // 사용 금지 → fgets() 사용

## 7. 전처리기

### 매크로와 헤더
#include <stdio.h>   // 시스템 헤더
#include "myfile.h"  // 사용자 헤더
#define PI 3.14159
#define MAX(a,b) ((a) > (b) ? (a) : (b))
#ifdef DEBUG ... #endif
#ifndef HEADER_H ... #define HEADER_H ... #endif  // 헤더 가드

## 8. 메모리 구조

### 프로세스 메모리 영역
- 코드(Text) 영역: 실행 코드 (읽기 전용)
- 데이터 영역: 전역/정적 변수 (초기화)
- BSS 영역: 전역/정적 변수 (미초기화)
- 힙(Heap): 동적 할당 (malloc/free), 아래→위 성장
- 스택(Stack): 지역변수, 함수 호출 정보, 위→아래 성장
"""

CPP_TEXT = """
# C++ 프로그래밍: 객체지향과 현대 C++

## 1. C++ 기초와 C와의 차이

### C++ 특징
C++은 C의 상위 호환 언어로, 객체지향, 제네릭, 함수형 프로그래밍을 지원합니다.
- C와의 차이: 클래스, 레퍼런스, 함수 오버로딩, 네임스페이스, STL, 예외 처리
- 컴파일: g++ -std=c++17 main.cpp -o main

#include <iostream>
using namespace std;
int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}

### 레퍼런스 (Reference)
int x = 10;
int &ref = x;  // ref는 x의 별칭
ref = 20;      // x도 20이 됨
// 포인터와 달리 NULL 불가, 재할당 불가, 더 안전

// 함수 매개변수
void swap(int &a, int &b) {
    int temp = a; a = b; b = temp;
}

### 함수 오버로딩
int add(int a, int b) { return a + b; }
double add(double a, double b) { return a + b; }
// 같은 이름, 다른 매개변수 (타입/개수)

### 기본 매개변수
void greet(string name, string msg = "안녕하세요") {
    cout << name << ": " << msg << endl;
}

### 인라인 함수
inline int square(int x) { return x * x; }
// 함수 호출 오버헤드 제거 (작은 함수에 적합)

## 2. 클래스와 객체지향

### 클래스 정의
class Rectangle {
private:
    double width, height;

public:
    Rectangle(double w, double h) : width(w), height(h) {}

    double area() const { return width * height; }
    double perimeter() const { return 2 * (width + height); }

    // getter/setter
    double getWidth() const { return width; }
    void setWidth(double w) { width = w; }
};

### 생성자와 소멸자
class MyClass {
public:
    MyClass() { cout << "생성자" << endl; }            // 기본 생성자
    MyClass(int x) : value(x) {}                       // 매개변수 생성자
    MyClass(const MyClass &other) : value(other.value) {} // 복사 생성자
    ~MyClass() { cout << "소멸자" << endl; }           // 소멸자
private:
    int value;
};

### 연산자 오버로딩
class Vector2D {
public:
    double x, y;
    Vector2D operator+(const Vector2D &v) const {
        return {x + v.x, y + v.y};
    }
    Vector2D& operator+=(const Vector2D &v) {
        x += v.x; y += v.y; return *this;
    }
    friend ostream& operator<<(ostream &os, const Vector2D &v) {
        return os << "(" << v.x << ", " << v.y << ")";
    }
};

### 상속과 다형성
class Animal {
public:
    string name;
    Animal(string n) : name(n) {}
    virtual void speak() { cout << "..." << endl; } // 가상 함수
    virtual ~Animal() {} // 가상 소멸자 (필수!)
};

class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}
    void speak() override { cout << name << ": Woof!" << endl; }
};

Animal* a = new Dog("Rex");
a->speak(); // Dog::speak() 호출 (동적 바인딩)
delete a;

// 순수 가상 함수와 추상 클래스
class Shape {
public:
    virtual double area() = 0; // 순수 가상 함수
    virtual ~Shape() {}
};

### 다중 상속
class A { public: void funcA() {} };
class B { public: void funcB() {} };
class C : public A, public B {}; // A와 B 모두 상속
// 다이아몬드 문제: virtual 상속으로 해결

## 3. 현대 C++ (C++11/14/17/20)

### 스마트 포인터 (메모리 관리 자동화)
#include <memory>
unique_ptr<int> p1 = make_unique<int>(10);  // 단독 소유권
shared_ptr<int> p2 = make_shared<int>(20);  // 공유 소유권 (참조 카운팅)
weak_ptr<int> p3 = p2;                       // 순환 참조 방지
// 자동으로 메모리 해제 (RAII 패턴)

### 이동 시맨틱과 우측값 참조
class Buffer {
    int* data;
public:
    Buffer(Buffer&& other) noexcept : data(other.data) {
        other.data = nullptr; // 이동 후 원본 무효화
    }
};
// std::move()로 이동 시맨틱 강제 적용

### 람다 표현식
auto add = [](int a, int b) { return a + b; };
int x = 10;
auto capture = [x, &y]() { return x + y; }; // 값/참조 캡처
auto generic = [](auto a, auto b) { return a + b; }; // 제네릭 람다

### 범위 기반 for
vector<int> v = {1, 2, 3, 4, 5};
for (int x : v) cout << x << " ";
for (auto& x : v) x *= 2; // 참조로 수정

### auto와 타입 추론
auto x = 42;         // int
auto y = 3.14;       // double
auto z = "hello";    // const char*
auto it = v.begin(); // iterator

### nullptr
int* p = nullptr; // NULL 대신 (타입 안전)

## 4. STL (Standard Template Library)

### 컨테이너
vector<int> v = {3, 1, 4, 1, 5};  // 동적 배열
list<int> l;                         // 이중 연결 리스트
deque<int> dq;                       // 양방향 큐
set<int> s;                          // 정렬된 고유 집합
map<string, int> m;                  // 정렬된 키-값 쌍
unordered_map<string, int> um;       // 해시 맵 O(1)
stack<int> st;                       // LIFO
queue<int> q;                        // FIFO
priority_queue<int> pq;              // 최대 힙

### 알고리즘
#include <algorithm>
sort(v.begin(), v.end());                    // 정렬
sort(v.begin(), v.end(), greater<int>());    // 내림차순
reverse(v.begin(), v.end());                // 역순
find(v.begin(), v.end(), 4);                // 탐색
count(v.begin(), v.end(), 1);               // 개수
max_element(v.begin(), v.end());            // 최대값
accumulate(v.begin(), v.end(), 0);          // 합계 (numeric)
transform(v.begin(), v.end(), v.begin(),    // 변환
    [](int x) { return x * 2; });

### 이터레이터
for (auto it = v.begin(); it != v.end(); ++it) {
    cout << *it << " ";
}
// 역방향: rbegin(), rend()
// 삽입: back_inserter, inserter

## 5. 템플릿

### 함수 템플릿
template<typename T>
T max(T a, T b) { return a > b ? a : b; }
max(3, 4);       // int
max(3.14, 2.71); // double

### 클래스 템플릿
template<typename T, int Size>
class Array {
    T data[Size];
public:
    T& operator[](int i) { return data[i]; }
    int size() const { return Size; }
};
Array<int, 10> arr;

### 템플릿 특수화
template<> class Array<bool, 8> { /* 비트 최적화 */ };

## 6. 예외 처리

try {
    throw runtime_error("오류 발생!");
} catch (const runtime_error& e) {
    cerr << "RuntimeError: " << e.what() << endl;
} catch (const exception& e) {
    cerr << "Exception: " << e.what() << endl;
} catch (...) {
    cerr << "알 수 없는 오류" << endl;
}

// noexcept: 예외 발생 없음을 보장
void func() noexcept { }

## 7. 네임스페이스

namespace mylib {
    void print() { cout << "mylib::print" << endl; }
    namespace detail { void helper() {} }
}
mylib::print();
using namespace mylib; // 주의: 이름 충돌 가능
using mylib::print;    // 특정 것만 가져오기
"""

# ── PostgreSQL ───────────────────────────────────────────
print("Connecting to PostgreSQL...")
conn = psycopg2.connect(DB_URL)
conn.autocommit = False
cur = conn.cursor()

# Create tables if not exist
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20),
    created_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS lectures (
    id VARCHAR PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    instructor_id VARCHAR REFERENCES users(id),
    source_text_gcs_path VARCHAR(500),
    graph_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR PRIMARY KEY,
    lecture_id VARCHAR REFERENCES lectures(id),
    student_id VARCHAR REFERENCES users(id),
    enrolled_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS assignment_generations (
    id VARCHAR PRIMARY KEY,
    lecture_id VARCHAR REFERENCES lectures(id),
    student_id VARCHAR REFERENCES users(id),
    selected_keywords JSONB,
    generated_text TEXT,
    assignment_type VARCHAR(50),
    created_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR PRIMARY KEY,
    assignment_generation_id VARCHAR REFERENCES assignment_generations(id),
    student_id VARCHAR REFERENCES users(id),
    lecture_id VARCHAR REFERENCES lectures(id),
    answer_text TEXT,
    submitted_at TIMESTAMP
);
""")

print("Creating users...")
users = {
    "admin":     make_user("admin",      "관리자",  "admin@renode.io"),
    "teacher1":  make_user("instructor", "선생1",   "teacher1@renode.io"),
    "student1":  make_user("student",    "학생1",   "student1@renode.io"),
    "student2":  make_user("student",    "학생2",   "student2@renode.io"),
    "manager1":  make_user("manager",    "매니저1", "manager1@renode.io"),
}

for key, u in users.items():
    cur.execute("""
        INSERT INTO users (id, name, email, password_hash, role, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role
        RETURNING id
    """, u)
    users[key] = (cur.fetchone()[0],) + u[1:]

instructor_id = users["teacher1"][0]
student_ids   = [users["student1"][0], users["student2"][0]]

# ── Lecture definitions ──────────────────────────────────
LECTURES = [
    {
        "title": "Python 프로그래밍: 문법과 알고리즘",
        "description": "Python 기본 문법, 자료구조, 정렬/탐색 알고리즘, 동적 프로그래밍 등 핵심 개념을 다룹니다.",
        "text": PYTHON_TEXT,
        "nodes": [
            {"id": "python",          "label": "Python",              "type": "Topic",       "description": "동적 타입 고수준 프로그래밍 언어"},
            {"id": "variables",       "label": "변수와 자료형",        "type": "Concept",     "description": "정수, 실수, 문자열, 불리언 등 기본 자료형"},
            {"id": "int_type",        "label": "정수(int)",            "type": "Definition",  "description": "정수형 자료형, 예: x = 10"},
            {"id": "str_type",        "label": "문자열(str)",          "type": "Definition",  "description": "문자열 자료형, 예: name = 'Python'"},
            {"id": "list_type",       "label": "리스트(list)",         "type": "Definition",  "description": "순서 있는 가변 시퀀스, 예: [1, 2, 3]"},
            {"id": "dict_type",       "label": "딕셔너리(dict)",       "type": "Definition",  "description": "키-값 쌍의 해시 테이블"},
            {"id": "if_statement",    "label": "조건문(if-elif-else)", "type": "Concept",     "description": "조건에 따라 코드 블록을 실행"},
            {"id": "for_loop",        "label": "for 반복문",           "type": "Concept",     "description": "시퀀스를 순회하는 반복문"},
            {"id": "while_loop",      "label": "while 반복문",         "type": "Concept",     "description": "조건이 참인 동안 반복"},
            {"id": "function",        "label": "함수(def)",            "type": "Concept",     "description": "재사용 가능한 코드 블록을 정의"},
            {"id": "lambda",          "label": "람다 함수",            "type": "Concept",     "description": "익명 함수, 예: lambda x: x * 2"},
            {"id": "oop",             "label": "객체지향 프로그래밍",   "type": "Topic",       "description": "클래스와 객체를 기반으로 한 프로그래밍 패러다임"},
            {"id": "class",           "label": "클래스(class)",        "type": "Concept",     "description": "객체를 생성하는 설계도"},
            {"id": "inheritance",     "label": "상속(Inheritance)",    "type": "Concept",     "description": "부모 클래스의 속성을 자식 클래스가 물려받음"},
            {"id": "exception",       "label": "예외처리(try-except)", "type": "Concept",     "description": "런타임 오류를 처리하는 구문"},
            {"id": "list_comp",       "label": "리스트 컴프리헨션",    "type": "Concept",     "description": "간결하게 리스트를 생성하는 표현식"},
            {"id": "generator",       "label": "제너레이터",           "type": "Concept",     "description": "yield를 사용한 지연 평가 이터레이터"},
            {"id": "decorator",       "label": "데코레이터",           "type": "Concept",     "description": "함수를 감싸 기능을 추가하는 패턴"},
            {"id": "stack",           "label": "스택(Stack)",          "type": "Definition",  "description": "LIFO 자료구조"},
            {"id": "queue",           "label": "큐(Queue)",            "type": "Definition",  "description": "FIFO 자료구조"},
            {"id": "linked_list",     "label": "연결 리스트",          "type": "Definition",  "description": "노드가 포인터로 연결된 선형 자료구조"},
            {"id": "hash_table",      "label": "해시 테이블",          "type": "Definition",  "description": "키를 해시하여 O(1) 접근을 제공하는 자료구조"},
            {"id": "tree",            "label": "트리(Tree)",           "type": "Definition",  "description": "계층적 자료구조"},
            {"id": "graph_ds",        "label": "그래프(Graph)",        "type": "Definition",  "description": "정점과 간선으로 구성된 자료구조"},
            {"id": "big_o",           "label": "빅오 표기법(Big-O)",   "type": "Concept",     "description": "알고리즘 시간/공간 복잡도 표기법"},
            {"id": "bubble_sort",     "label": "버블 정렬",            "type": "Example",     "description": "인접 원소를 비교·교환하는 O(n²) 정렬"},
            {"id": "merge_sort",      "label": "합병 정렬",            "type": "Concept",     "description": "분할 정복 기반 O(n log n) 정렬"},
            {"id": "quick_sort",      "label": "퀵 정렬",              "type": "Concept",     "description": "피벗 기준 분할하는 평균 O(n log n) 정렬"},
            {"id": "binary_search",   "label": "이진 탐색",            "type": "Concept",     "description": "정렬된 배열에서 O(log n) 탐색"},
            {"id": "dfs",             "label": "DFS(깊이 우선 탐색)",  "type": "Concept",     "description": "스택/재귀로 그래프를 깊이 방향으로 탐색"},
            {"id": "bfs",             "label": "BFS(너비 우선 탐색)",  "type": "Concept",     "description": "큐로 그래프를 레벨 순서로 탐색"},
            {"id": "dynamic_prog",    "label": "동적 프로그래밍(DP)",  "type": "Concept",     "description": "메모이제이션으로 중복 계산을 제거"},
            {"id": "greedy",          "label": "탐욕 알고리즘",        "type": "Concept",     "description": "각 단계에서 지역 최적 선택"},
            {"id": "recursion",       "label": "재귀(Recursion)",      "type": "Concept",     "description": "함수가 자기 자신을 호출하는 기법"},
            {"id": "divide_conquer",  "label": "분할 정복",            "type": "Concept",     "description": "문제를 작은 부분으로 나누어 해결"},
        ],
        "edges": [
            {"source": "python",       "target": "variables",     "relation": "PART_OF"},
            {"source": "python",       "target": "if_statement",  "relation": "PART_OF"},
            {"source": "python",       "target": "for_loop",      "relation": "PART_OF"},
            {"source": "python",       "target": "while_loop",    "relation": "PART_OF"},
            {"source": "python",       "target": "function",      "relation": "PART_OF"},
            {"source": "python",       "target": "oop",           "relation": "PART_OF"},
            {"source": "variables",    "target": "int_type",      "relation": "EXPLAINS"},
            {"source": "variables",    "target": "str_type",      "relation": "EXPLAINS"},
            {"source": "variables",    "target": "list_type",     "relation": "EXPLAINS"},
            {"source": "variables",    "target": "dict_type",     "relation": "EXPLAINS"},
            {"source": "function",     "target": "lambda",        "relation": "RELATES_TO"},
            {"source": "function",     "target": "decorator",     "relation": "RELATES_TO"},
            {"source": "function",     "target": "generator",     "relation": "RELATES_TO"},
            {"source": "function",     "target": "recursion",     "relation": "RELATES_TO"},
            {"source": "list_type",    "target": "list_comp",     "relation": "RELATES_TO"},
            {"source": "oop",          "target": "class",         "relation": "EXPLAINS"},
            {"source": "class",        "target": "inheritance",   "relation": "RELATES_TO"},
            {"source": "if_statement", "target": "exception",     "relation": "RELATES_TO"},
            {"source": "dict_type",    "target": "hash_table",    "relation": "EXAMPLE_OF"},
            {"source": "list_type",    "target": "stack",         "relation": "EXAMPLE_OF"},
            {"source": "stack",        "target": "queue",         "relation": "RELATES_TO"},
            {"source": "stack",        "target": "dfs",           "relation": "PREREQUISITE_OF"},
            {"source": "queue",        "target": "bfs",           "relation": "PREREQUISITE_OF"},
            {"source": "tree",         "target": "graph_ds",      "relation": "RELATES_TO"},
            {"source": "graph_ds",     "target": "dfs",           "relation": "RELATES_TO"},
            {"source": "graph_ds",     "target": "bfs",           "relation": "RELATES_TO"},
            {"source": "big_o",        "target": "bubble_sort",   "relation": "EXPLAINS"},
            {"source": "big_o",        "target": "merge_sort",    "relation": "EXPLAINS"},
            {"source": "big_o",        "target": "quick_sort",    "relation": "EXPLAINS"},
            {"source": "big_o",        "target": "binary_search", "relation": "EXPLAINS"},
            {"source": "divide_conquer","target": "merge_sort",   "relation": "EXAMPLE_OF"},
            {"source": "divide_conquer","target": "quick_sort",   "relation": "EXAMPLE_OF"},
            {"source": "divide_conquer","target": "binary_search","relation": "EXAMPLE_OF"},
            {"source": "recursion",    "target": "dynamic_prog",  "relation": "PREREQUISITE_OF"},
            {"source": "recursion",    "target": "divide_conquer","relation": "PREREQUISITE_OF"},
            {"source": "recursion",    "target": "dfs",           "relation": "EXAMPLE_OF"},
            {"source": "dynamic_prog", "target": "greedy",        "relation": "RELATES_TO"},
            {"source": "bubble_sort",  "target": "merge_sort",    "relation": "RELATES_TO"},
            {"source": "linked_list",  "target": "stack",         "relation": "RELATES_TO"},
            {"source": "linked_list",  "target": "queue",         "relation": "RELATES_TO"},
        ],
    },
    {
        "title": "Java 프로그래밍: 객체지향과 핵심 개념",
        "description": "JVM 구조, OOP(상속/다형성/인터페이스), 제네릭, 컬렉션 프레임워크, 람다·스트림(Java 8+), 스레드 등 Java 핵심 개념을 다룹니다.",
        "text": JAVA_TEXT,
        "nodes": [
            {"id": "java",             "label": "Java",                    "type": "Topic",       "description": "JVM 기반 정적 타입 객체지향 언어"},
            {"id": "jvm",              "label": "JVM",                     "type": "Concept",     "description": "Java Virtual Machine, 플랫폼 독립 실행 환경"},
            {"id": "jdk_jre",          "label": "JDK/JRE",                 "type": "Concept",     "description": "개발 도구(JDK)와 실행 환경(JRE)"},
            {"id": "primitive",        "label": "기본형(Primitive)",        "type": "Definition",  "description": "int, double, boolean 등 스택 저장"},
            {"id": "reference_type",   "label": "참조형(Reference)",        "type": "Definition",  "description": "String, Array, Object 등 힙 저장"},
            {"id": "boxing",           "label": "박싱/언박싱",              "type": "Concept",     "description": "int ↔ Integer 자동 변환"},
            {"id": "java_class",       "label": "클래스(Class)",            "type": "Concept",     "description": "객체를 생성하는 설계도, 필드+메서드"},
            {"id": "constructor",      "label": "생성자(Constructor)",      "type": "Concept",     "description": "객체 초기화 메서드"},
            {"id": "java_inheritance", "label": "상속(extends)",            "type": "Concept",     "description": "부모 클래스 기능을 자식 클래스가 재사용"},
            {"id": "java_polymorphism","label": "다형성(Polymorphism)",     "type": "Concept",     "description": "업캐스팅과 동적 바인딩"},
            {"id": "abstract_class",   "label": "추상 클래스",             "type": "Concept",     "description": "abstract 메서드를 가진 인스턴스화 불가 클래스"},
            {"id": "interface",        "label": "인터페이스(Interface)",    "type": "Concept",     "description": "추상 메서드와 디폴트 메서드를 정의한 계약"},
            {"id": "encapsulation",    "label": "캡슐화(Encapsulation)",   "type": "Concept",     "description": "private 필드 + getter/setter로 데이터 보호"},
            {"id": "generics",         "label": "제네릭(Generics)",        "type": "Concept",     "description": "타입 매개변수로 타입 안전성 보장"},
            {"id": "collections",      "label": "컬렉션 프레임워크",        "type": "Topic",       "description": "List, Set, Map, Queue 자료구조 모음"},
            {"id": "arraylist",        "label": "ArrayList",               "type": "Definition",  "description": "동적 배열 기반 List 구현체"},
            {"id": "hashmap",          "label": "HashMap",                 "type": "Definition",  "description": "해시 기반 키-값 Map 구현체"},
            {"id": "java_exception",   "label": "예외 처리(Exception)",    "type": "Concept",     "description": "Checked/Unchecked 예외와 try-catch-finally"},
            {"id": "thread",           "label": "스레드(Thread)",          "type": "Concept",     "description": "병렬 실행 단위, Runnable/Callable"},
            {"id": "synchronized",     "label": "동기화(synchronized)",    "type": "Concept",     "description": "상호 배제로 스레드 안전성 보장"},
            {"id": "lambda_java",      "label": "람다 표현식",             "type": "Concept",     "description": "함수형 인터페이스를 간결히 구현"},
            {"id": "stream_api",       "label": "스트림 API",              "type": "Concept",     "description": "filter/map/reduce 등 선언적 컬렉션 처리"},
            {"id": "optional",         "label": "Optional",                "type": "Concept",     "description": "null 안전 컨테이너 클래스"},
            {"id": "gc_java",          "label": "가비지 컬렉션(GC)",       "type": "Concept",     "description": "JVM 자동 메모리 관리"},
            {"id": "java_array",       "label": "배열(Array)",             "type": "Definition",  "description": "고정 크기 동일 타입 원소 모음"},
            {"id": "access_modifier",  "label": "접근 제한자",             "type": "Concept",     "description": "public/private/protected/default"},
        ],
        "edges": [
            {"source": "java",              "target": "jvm",              "relation": "PART_OF"},
            {"source": "jvm",               "target": "jdk_jre",          "relation": "EXPLAINS"},
            {"source": "jvm",               "target": "gc_java",          "relation": "RELATES_TO"},
            {"source": "java",              "target": "primitive",        "relation": "PART_OF"},
            {"source": "java",              "target": "reference_type",   "relation": "PART_OF"},
            {"source": "primitive",         "target": "boxing",           "relation": "RELATES_TO"},
            {"source": "java",              "target": "java_class",       "relation": "PART_OF"},
            {"source": "java_class",        "target": "constructor",      "relation": "PART_OF"},
            {"source": "java_class",        "target": "encapsulation",    "relation": "RELATES_TO"},
            {"source": "java_class",        "target": "access_modifier",  "relation": "RELATES_TO"},
            {"source": "java_class",        "target": "java_inheritance", "relation": "PREREQUISITE_OF"},
            {"source": "java_inheritance",  "target": "java_polymorphism","relation": "PREREQUISITE_OF"},
            {"source": "java_inheritance",  "target": "abstract_class",   "relation": "RELATES_TO"},
            {"source": "interface",         "target": "java_polymorphism","relation": "RELATES_TO"},
            {"source": "abstract_class",    "target": "interface",        "relation": "RELATES_TO"},
            {"source": "java",              "target": "generics",         "relation": "PART_OF"},
            {"source": "generics",          "target": "collections",      "relation": "PREREQUISITE_OF"},
            {"source": "collections",       "target": "arraylist",        "relation": "EXPLAINS"},
            {"source": "collections",       "target": "hashmap",          "relation": "EXPLAINS"},
            {"source": "java",              "target": "java_exception",   "relation": "PART_OF"},
            {"source": "java",              "target": "thread",           "relation": "PART_OF"},
            {"source": "thread",            "target": "synchronized",     "relation": "RELATES_TO"},
            {"source": "java",              "target": "lambda_java",      "relation": "PART_OF"},
            {"source": "lambda_java",       "target": "stream_api",       "relation": "PREREQUISITE_OF"},
            {"source": "stream_api",        "target": "collections",      "relation": "RELATES_TO"},
            {"source": "stream_api",        "target": "optional",         "relation": "RELATES_TO"},
            {"source": "reference_type",    "target": "java_array",       "relation": "EXPLAINS"},
            {"source": "java_array",        "target": "arraylist",        "relation": "RELATES_TO"},
        ],
    },
    {
        "title": "C 언어 프로그래밍: 기초부터 시스템까지",
        "description": "C 언어 기본 문법, 포인터와 메모리 관리, 구조체, 파일 입출력, 프로세스 메모리 구조 등 시스템 프로그래밍의 핵심을 다룹니다.",
        "text": C_TEXT,
        "nodes": [
            {"id": "c_lang",          "label": "C 언어",                 "type": "Topic",       "description": "절차적 시스템 프로그래밍 언어"},
            {"id": "c_datatypes",     "label": "C 자료형",               "type": "Concept",     "description": "int, double, char, unsigned 등 기본 자료형"},
            {"id": "c_operators",     "label": "연산자",                 "type": "Concept",     "description": "산술/비교/논리/비트/포인터 연산자"},
            {"id": "c_control",       "label": "제어문",                 "type": "Concept",     "description": "if-else, switch, for, while, do-while"},
            {"id": "pointer",         "label": "포인터(Pointer)",        "type": "Concept",     "description": "메모리 주소를 저장하는 변수, * & 연산자"},
            {"id": "pointer_arith",   "label": "포인터 연산",            "type": "Concept",     "description": "포인터 증감으로 배열 순회"},
            {"id": "double_pointer",  "label": "이중 포인터",            "type": "Concept",     "description": "포인터의 포인터, 2차원 배열 등에 활용"},
            {"id": "dynamic_mem",     "label": "동적 메모리 할당",       "type": "Concept",     "description": "malloc, calloc, realloc, free"},
            {"id": "malloc",          "label": "malloc/free",            "type": "Definition",  "description": "힙 메모리 할당과 해제"},
            {"id": "memory_leak",     "label": "메모리 누수",            "type": "Concept",     "description": "free 없이 포인터를 잃어 메모리 낭비"},
            {"id": "dangling_ptr",    "label": "댕글링 포인터",          "type": "Concept",     "description": "해제된 메모리를 가리키는 포인터"},
            {"id": "c_function",      "label": "함수",                   "type": "Concept",     "description": "코드 재사용 단위, 값 전달 vs 포인터 전달"},
            {"id": "func_pointer",    "label": "함수 포인터",            "type": "Concept",     "description": "함수 주소를 저장하는 포인터, 콜백에 활용"},
            {"id": "c_recursion",     "label": "재귀 함수",              "type": "Concept",     "description": "자기 자신을 호출하는 함수"},
            {"id": "c_array",         "label": "배열",                   "type": "Definition",  "description": "동일 타입 원소의 연속된 메모리 블록"},
            {"id": "c_string",        "label": "문자열(char[])",         "type": "Definition",  "description": "NULL 종료 문자 배열, string.h 함수"},
            {"id": "struct",          "label": "구조체(struct)",         "type": "Concept",     "description": "여러 자료형을 묶은 사용자 정의 타입"},
            {"id": "typedef",         "label": "typedef",                "type": "Concept",     "description": "타입에 별칭 부여"},
            {"id": "union_c",         "label": "공용체(union)",          "type": "Concept",     "description": "모든 멤버가 같은 메모리 공간 공유"},
            {"id": "enum_c",          "label": "열거형(enum)",           "type": "Concept",     "description": "명명된 정수 상수 집합"},
            {"id": "file_io",         "label": "파일 입출력",            "type": "Concept",     "description": "fopen, fclose, fprintf, fscanf, fgets"},
            {"id": "preprocessor",    "label": "전처리기",               "type": "Concept",     "description": "#include, #define, #ifdef 등"},
            {"id": "macro",           "label": "매크로(#define)",        "type": "Definition",  "description": "컴파일 전 텍스트 치환"},
            {"id": "memory_layout",   "label": "프로세스 메모리 구조",   "type": "Concept",     "description": "코드/데이터/BSS/힙/스택 영역"},
            {"id": "stack_mem",       "label": "스택 영역",              "type": "Definition",  "description": "지역변수와 함수 호출 정보 저장"},
            {"id": "heap_mem",        "label": "힙 영역",                "type": "Definition",  "description": "동적 할당 메모리, malloc으로 관리"},
        ],
        "edges": [
            {"source": "c_lang",        "target": "c_datatypes",    "relation": "PART_OF"},
            {"source": "c_lang",        "target": "c_operators",    "relation": "PART_OF"},
            {"source": "c_lang",        "target": "c_control",      "relation": "PART_OF"},
            {"source": "c_lang",        "target": "c_function",     "relation": "PART_OF"},
            {"source": "c_lang",        "target": "pointer",        "relation": "PART_OF"},
            {"source": "c_lang",        "target": "struct",         "relation": "PART_OF"},
            {"source": "c_lang",        "target": "preprocessor",   "relation": "PART_OF"},
            {"source": "pointer",       "target": "pointer_arith",  "relation": "EXPLAINS"},
            {"source": "pointer",       "target": "double_pointer", "relation": "RELATES_TO"},
            {"source": "pointer",       "target": "dynamic_mem",    "relation": "PREREQUISITE_OF"},
            {"source": "pointer",       "target": "c_array",        "relation": "RELATES_TO"},
            {"source": "pointer",       "target": "func_pointer",   "relation": "RELATES_TO"},
            {"source": "dynamic_mem",   "target": "malloc",         "relation": "EXPLAINS"},
            {"source": "dynamic_mem",   "target": "memory_leak",    "relation": "RELATES_TO"},
            {"source": "dynamic_mem",   "target": "dangling_ptr",   "relation": "RELATES_TO"},
            {"source": "malloc",        "target": "heap_mem",       "relation": "RELATES_TO"},
            {"source": "c_function",    "target": "c_recursion",    "relation": "RELATES_TO"},
            {"source": "c_function",    "target": "func_pointer",   "relation": "RELATES_TO"},
            {"source": "c_array",       "target": "c_string",       "relation": "RELATES_TO"},
            {"source": "struct",        "target": "typedef",        "relation": "RELATES_TO"},
            {"source": "struct",        "target": "union_c",        "relation": "RELATES_TO"},
            {"source": "struct",        "target": "pointer",        "relation": "RELATES_TO"},
            {"source": "enum_c",        "target": "c_datatypes",    "relation": "RELATES_TO"},
            {"source": "preprocessor",  "target": "macro",          "relation": "EXPLAINS"},
            {"source": "memory_layout", "target": "stack_mem",      "relation": "EXPLAINS"},
            {"source": "memory_layout", "target": "heap_mem",       "relation": "EXPLAINS"},
            {"source": "stack_mem",     "target": "c_function",     "relation": "RELATES_TO"},
            {"source": "heap_mem",      "target": "dynamic_mem",    "relation": "RELATES_TO"},
            {"source": "c_lang",        "target": "file_io",        "relation": "PART_OF"},
            {"source": "c_lang",        "target": "memory_layout",  "relation": "PART_OF"},
        ],
    },
    {
        "title": "C++ 프로그래밍: 객체지향과 현대 C++",
        "description": "C와의 차이, 클래스/연산자 오버로딩/다중상속, 스마트 포인터, 이동 시맨틱, 람다, STL, 템플릿 등 현대 C++(C++11/17) 핵심을 다룹니다.",
        "text": CPP_TEXT,
        "nodes": [
            {"id": "cpp",              "label": "C++",                   "type": "Topic",       "description": "C 상위 호환의 다중 패러다임 언어"},
            {"id": "reference",        "label": "레퍼런스(Reference)",   "type": "Concept",     "description": "변수의 별칭, 포인터보다 안전"},
            {"id": "overloading",      "label": "함수 오버로딩",         "type": "Concept",     "description": "같은 이름, 다른 매개변수 함수"},
            {"id": "cpp_class",        "label": "클래스(Class)",         "type": "Concept",     "description": "멤버 변수+함수를 캡슐화한 사용자 정의 타입"},
            {"id": "cpp_constructor",  "label": "생성자/소멸자",         "type": "Concept",     "description": "객체 생성·소멸 시 자동 호출"},
            {"id": "copy_constructor", "label": "복사 생성자",           "type": "Concept",     "description": "기존 객체로 새 객체 초기화"},
            {"id": "op_overload",      "label": "연산자 오버로딩",       "type": "Concept",     "description": "사용자 타입에 연산자 재정의"},
            {"id": "cpp_inheritance",  "label": "상속(Inheritance)",     "type": "Concept",     "description": "부모 클래스 기능 재사용"},
            {"id": "virtual_func",     "label": "가상 함수(virtual)",    "type": "Concept",     "description": "동적 바인딩, override 키워드"},
            {"id": "pure_virtual",     "label": "순수 가상 함수",        "type": "Concept",     "description": "=0으로 선언, 추상 클래스 형성"},
            {"id": "multiple_inherit", "label": "다중 상속",             "type": "Concept",     "description": "여러 부모 클래스 상속, 다이아몬드 문제"},
            {"id": "smart_ptr",        "label": "스마트 포인터",         "type": "Concept",     "description": "unique_ptr/shared_ptr/weak_ptr, RAII 패턴"},
            {"id": "unique_ptr",       "label": "unique_ptr",            "type": "Definition",  "description": "단독 소유권 스마트 포인터"},
            {"id": "shared_ptr",       "label": "shared_ptr",            "type": "Definition",  "description": "참조 카운팅 기반 공유 소유권"},
            {"id": "move_semantics",   "label": "이동 시맨틱",           "type": "Concept",     "description": "우측값 참조(&&)로 불필요한 복사 제거"},
            {"id": "lambda_cpp",       "label": "람다 표현식",           "type": "Concept",     "description": "익명 함수 객체, 캡처 리스트"},
            {"id": "auto_type",        "label": "auto 타입 추론",        "type": "Concept",     "description": "컴파일러가 타입을 자동으로 추론"},
            {"id": "range_for",        "label": "범위 기반 for",         "type": "Concept",     "description": "컨테이너를 간결하게 순회"},
            {"id": "stl",              "label": "STL",                   "type": "Topic",       "description": "Standard Template Library: 컨테이너+알고리즘+이터레이터"},
            {"id": "stl_vector",       "label": "vector",                "type": "Definition",  "description": "동적 배열 컨테이너"},
            {"id": "stl_map",          "label": "map/unordered_map",     "type": "Definition",  "description": "정렬 트리/해시 키-값 컨테이너"},
            {"id": "stl_algorithm",    "label": "STL 알고리즘",          "type": "Concept",     "description": "sort/find/transform 등 제네릭 알고리즘"},
            {"id": "iterator",         "label": "이터레이터",            "type": "Concept",     "description": "컨테이너 원소 순회를 추상화한 포인터 유사 객체"},
            {"id": "template_cpp",     "label": "템플릿(Template)",      "type": "Concept",     "description": "타입 매개변수로 제네릭 함수/클래스 정의"},
            {"id": "cpp_exception",    "label": "예외 처리",             "type": "Concept",     "description": "try-catch-throw, noexcept"},
            {"id": "namespace",        "label": "네임스페이스",          "type": "Concept",     "description": "이름 충돌 방지를 위한 범위 지정"},
        ],
        "edges": [
            {"source": "cpp",             "target": "reference",        "relation": "PART_OF"},
            {"source": "cpp",             "target": "overloading",      "relation": "PART_OF"},
            {"source": "cpp",             "target": "cpp_class",        "relation": "PART_OF"},
            {"source": "cpp",             "target": "stl",              "relation": "PART_OF"},
            {"source": "cpp",             "target": "template_cpp",     "relation": "PART_OF"},
            {"source": "cpp",             "target": "namespace",        "relation": "PART_OF"},
            {"source": "cpp_class",       "target": "cpp_constructor",  "relation": "PART_OF"},
            {"source": "cpp_constructor", "target": "copy_constructor", "relation": "RELATES_TO"},
            {"source": "cpp_constructor", "target": "move_semantics",   "relation": "RELATES_TO"},
            {"source": "cpp_class",       "target": "op_overload",      "relation": "RELATES_TO"},
            {"source": "cpp_class",       "target": "cpp_inheritance",  "relation": "PREREQUISITE_OF"},
            {"source": "cpp_inheritance", "target": "virtual_func",     "relation": "RELATES_TO"},
            {"source": "virtual_func",    "target": "pure_virtual",     "relation": "RELATES_TO"},
            {"source": "cpp_inheritance", "target": "multiple_inherit", "relation": "RELATES_TO"},
            {"source": "cpp",             "target": "smart_ptr",        "relation": "PART_OF"},
            {"source": "smart_ptr",       "target": "unique_ptr",       "relation": "EXPLAINS"},
            {"source": "smart_ptr",       "target": "shared_ptr",       "relation": "EXPLAINS"},
            {"source": "cpp",             "target": "lambda_cpp",       "relation": "PART_OF"},
            {"source": "cpp",             "target": "auto_type",        "relation": "PART_OF"},
            {"source": "cpp",             "target": "range_for",        "relation": "PART_OF"},
            {"source": "stl",             "target": "stl_vector",       "relation": "EXPLAINS"},
            {"source": "stl",             "target": "stl_map",          "relation": "EXPLAINS"},
            {"source": "stl",             "target": "stl_algorithm",    "relation": "EXPLAINS"},
            {"source": "stl",             "target": "iterator",         "relation": "EXPLAINS"},
            {"source": "template_cpp",    "target": "stl",              "relation": "PREREQUISITE_OF"},
            {"source": "iterator",        "target": "stl_algorithm",    "relation": "PREREQUISITE_OF"},
            {"source": "lambda_cpp",      "target": "stl_algorithm",    "relation": "RELATES_TO"},
            {"source": "cpp",             "target": "cpp_exception",    "relation": "PART_OF"},
            {"source": "move_semantics",  "target": "smart_ptr",        "relation": "RELATES_TO"},
            {"source": "auto_type",       "target": "range_for",        "relation": "RELATES_TO"},
        ],
    },
]

# ── Insert Lectures + Enrollments ────────────────────────
print("\nCreating lectures and enrollments...")
lecture_ids = []
for lec in LECTURES:
    lid = new_id()
    lecture_ids.append(lid)
    cur.execute("""
        INSERT INTO lectures (id, title, description, instructor_id, source_text_gcs_path, graph_status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (lid, lec["title"], lec["description"], instructor_id,
          f"inline:{lec['text'][:200]}", "processing", now(), now()))
    for sid in student_ids:
        cur.execute("""
            INSERT INTO enrollments (id, lecture_id, student_id, enrolled_at)
            VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING
        """, (new_id(), lid, sid, now()))
    print(f"  Created: {lec['title']}")

conn.commit()
print("PostgreSQL data committed.")

# ── Neo4j: Store all knowledge graphs ───────────────────
print("\nStoring knowledge graphs in Neo4j...")
neo4j_uri_ssc = NEO4J_URI.replace("neo4j+s://", "neo4j+ssc://")
driver = GraphDatabase.driver(neo4j_uri_ssc, auth=(NEO4J_USER, NEO4J_PASS))

VALID_RELATIONS = {"EXPLAINS", "RELATES_TO", "PREREQUISITE_OF", "PART_OF", "EXAMPLE_OF"}

for i, (lec, lid) in enumerate(zip(LECTURES, lecture_ids)):
    nodes = lec["nodes"]
    edges = lec["edges"]
    with driver.session() as session:
        session.run("MATCH (n {lecture_id: $lid}) DETACH DELETE n", lid=lid)
        for node in nodes:
            session.run("""
                CREATE (n:KGNode {
                    node_id: $node_id,
                    lecture_id: $lecture_id,
                    label: $label,
                    type: $type,
                    description: $description
                })
            """, node_id=node["id"], lecture_id=lid,
                 label=node["label"], type=node.get("type", "Concept"),
                 description=node.get("description", ""))
        for edge in edges:
            rel = edge["relation"] if edge["relation"] in VALID_RELATIONS else "RELATES_TO"
            session.run(f"""
                MATCH (a:KGNode {{node_id: $source, lecture_id: $lid}})
                MATCH (b:KGNode {{node_id: $target, lecture_id: $lid}})
                CREATE (a)-[:{rel}]->(b)
            """, source=edge["source"], target=edge["target"], lid=lid)
    cur.execute("UPDATE lectures SET graph_status='completed' WHERE id=%s", (lid,))
    print(f"  Graph stored: {lec['title']} ({len(nodes)} nodes, {len(edges)} edges)")

conn.commit()
driver.close()
cur.close()
conn.close()

print("\n✅ Seed complete!")
print(f"  Lectures   : {len(LECTURES)}")
for lec, lid in zip(LECTURES, lecture_ids):
    print(f"    [{lid}] {lec['title']}")
print(f"  Accounts   : admin@renode.io / teacher1@renode.io / student1@renode.io / student2@renode.io / manager1@renode.io")
print(f"  Password   : 1234 (all accounts)")
