# Admin 사이트 개선 제안

## 📊 분석 개요

| 항목 | 현재 상태 |
|------|----------|
| **구조** | AdminApp + AuthContext + Pages (Dashboard, Services, Controllers, Pricing, Repairs) |
| **라우팅** | React Router (내부 네비게이션) |
| **인증** | 하드코딩된 비밀번호 (`pandaduck2025`) |
| **데이터베이스** | Supabase (Row Level Security 미사용) |
| **상태 관리** | React useState (각 페이지 독립) |

---

## 🔴 Critical (즉시 수정 필요)

### 1. 인증 시스템 보안 문제
**위험도**: ⚠️ 매우 높음

**문제점**:
```typescript
// src/admin/contexts/AuthContext.tsx
const ADMIN_PASSWORD = 'pandaduck2025'; // 하드코딩
const login = (password: string): boolean => {
  if (password === ADMIN_PASSWORD) {
    setIsAuthenticated(true);
    return true;
  }
  return false;
};
```

**문제**:
- ❌ 비밀번호가 소스 코드에 노출
- ❌ 클라이언트 사이드 인증 (서버 인증이 아님)
- ❌ `localStorage`에 인증 상태 저장 (XSS 취약)
- ❌ 개발자 도구로 쉽게 우회 가능

**해결 방안**:
```typescript
// 1. Supabase Row Level Security 사용
const { data: { user } } = await supabase.auth.getUser();

// 2. admin_users 테이블 생성
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

// 3. Supabase Auth 또는 Row Level Security 사용
const { data, error } = await supabase
  .from('admin_users')
  .select('*')
  .eq('email', email)
  .eq('password_hash', hashPassword(password))
  .single();
```

**우선순위**: 1

---

### 2. 서비스 추가 기능 누락
**파일**: `src/admin/pages/ServicesPage.tsx`

**문제점**:
```tsx
// 서비스 추가 버튼이 있지만 실제 기능 구현되지 않음
<button className="...">
  <Plus className="w-5 h-5" />
  서비스 추가
</button>
// AddServiceModal 컴포넌트가 없음
// setEditingService 함수가 정의되지 않음
```

**해결 방안**:
```tsx
// 1. AddServiceModal 컴포넌트 생성
interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: ServiceData) => Promise<void>;
}

export function AddServiceModal({ isOpen, onClose, onAdd }: AddServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    service_id: '',
    description: '',
    base_price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>서비스 추가</DialogTitle>
        <form onSubmit={handleSubmit}>
          {/* 폼 필드들 */}
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 2. ServicesPage.tsx에 통합
const [isAddModalOpen, setIsAddModalOpen] = useState(false);

const handleAddService = async (service: ServiceData) => {
  try {
    const { error } = await supabase
      .from('services')
      .insert(service);
    
    if (error) throw error;
    toast.success('서비스가 추가되었습니다.');
    await loadServices();
  } catch (error) {
    toast.error('서비스 추가에 실패했습니다.');
  }
};
```

**우선순위**: 1

---

## 🟠 High Priority (빨리 수정 필요)

### 3. UX: alert() 사용
**파일**: 모든 페이지

**문제점**:
```typescript
// 오류 및 성공 메시지가 alert()로 표시
alert('서비스 상태 변경에 실패했습니다.');
alert(`상태가 ${!currentStatus ? '활성' : '비활성'}으로 변경되었습니다.`);
```

**문제**:
- ❌ 브라우저 기본 alert (UX에 좋지 않음)
- ❌ 사용자 경험 저하
- ❌ 브랜딩이 없음
- ❌ 모달에서도 alert이 뜸

**해결 방안**:
```typescript
// 1. sonner 라이브러리 사용 (이미 설치됨)
import { toast } from 'sonner';

// 2. alert() → toast()로 교체
// Before:
alert('서비스 삭제에 실패했습니다.');

// After:
toast.error('서비스 삭제에 실패했습니다.');

// 3. Loading 상태 표시 추가
// Before:
const [loading, setLoading] = useState(true);
if (loading) {
  return <Spinner />;
}

// After:
const [loading, setLoading] = useState(true);
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner />
      <p className="ml-3">데이터를 불러오는 중...</p>
    </div>
  );
}
```

**우선순위**: 2

---

### 4. 모바일 반응형 미지원
**파일**: `src/admin/components/AdminLayout.tsx`

**문제점**:
```tsx
// 사이드바가 w-64 (256px)로 고정
<aside className="fixed top-0 left-0 h-full w-64 bg-white">
```

**문제**:
- ❌ 모바일 화면에서 사이드바가 공간을 너무 차지
- ❌ 테이블이 모바일에서 가로로 스크롤되어야 함
- ❌ 반응형 메뉴 없음

**해결 방안**:
```tsx
// 1. 모바일에서 햄버거 메뉴로 변경
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', checkMobile);
    checkMobile();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex ...`}>
        {/* 기존 사이드바 */}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">PandaDuck Fix</h1>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Menu */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <nav>{/* 사이드바 메뉴 항목 */}</nav>
      </Drawer>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

**우선순위**: 3

---

### 5. 로딩 상태 표시 부족
**파일**: 모든 페이지

**문제점**:
```typescript
// 로딩 표시가 단순 spinner만
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
    </div>
  );
}
```

**문제**:
- ❌ "데이터를 불러오는 중..." 메시지 없음
- ❌ Skeleton UI 없음
- ❌ 어떤 데이터를 로딩 중인지 알 수 없음

**해결 방안**:
```tsx
// 1. 로딩 메시지 추가
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">데이터를 불러오는 중...</p>
      </div>
    </div>
  );
}

// 2. Skeleton UI 추가
if (loading) {
  return (
    <div className="space-y-4">
      {Array(5).fill(null).map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}
```

**우선순위**: 4

---

### 6. 대시보드 실시간 업데이트 부족
**파일**: `src/admin/pages/Dashboard.tsx`

**문제점**:
```typescript
// useEffect에 의존성이 빠져서 자동으로 업데이트 안됨
useEffect(() => {
  loadStats();
}, []); // 빈 배열 = 한 번만 실행
```

**문제**:
- ❌ 새로고침해야 데이터 업데이트됨
- ❌ 실시간 알림 없음 (WebSocket, polling 없음)
- ❌ 탭 여러 개 열어도 동기화 안됨

**해결 방안**:
```typescript
// 1. polling 추가 (초당 1회)
useEffect(() => {
  loadStats();

  const interval = setInterval(() => {
    loadStats();
  }, 60000); // 1분마다 업데이트

  return () => clearInterval(interval);
}, [statusFilter]); // 필터 변경 시 재설정

// 2. WebSocket 사용 (Supabase Realtime)
useEffect(() => {
  const channel = supabase
    .channel('admin_stats')
    .on('postgres_changes', { event: 'INSERT' }, (payload) => {
      // 새 통계 데이터 자동 업데이트
      loadStats();
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}, []);

// 3. 탭 동기화 (localStorage)
const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

// 데이터 업데이트 시
setLastUpdate(Date.now());
localStorage.setItem('admin_stats_update', lastUpdate.toString());

// 다른 탭에서 변경 감지
useEffect(() => {
  const checkUpdates = () => {
    const lastUpdate = localStorage.getItem('admin_stats_update');
    if (lastUpdate && parseInt(lastUpdate) > Date.now() - 1000) {
      loadStats();
    }
  };
  
  const interval = setInterval(checkUpdates, 2000);
  return () => clearInterval(interval);
}, []);
```

**우선순위**: 5

---

## 🟡 Medium Priority (조만간 개선)

### 7. 네비게이션 경로 불일치
**파일**: `src/admin/components/AdminLayout.tsx`

**문제점**:
```typescript
// 경로 계산이 불일치함
const currentPage = location.pathname.split('/')[2] || 'dashboard';
// /admin/services -> 'services' (정상)
// /admin/services/detail/1 -> 'services/detail/1' (예상치 않음)
```

**문제**:
- ❌ 하위 경로에서 활성 메뉴가 정확하지 않음
- ❌ 사용자 헷갈릴 수 있음

**해결 방안**:
```typescript
// 1. useMatch 훅 사용 (react-router-dom)
import { useMatch } from 'react-router-dom';

const dashboardMatch = useMatch('/admin');
const servicesMatch = useMatch('/admin/services');
const repairsMatch = useMatch('/admin/repairs');

// 2. 활성 메뉴 결정
const currentPage = dashboardMatch ? 'dashboard'
  : servicesMatch ? 'services'
  : repairsMatch ? 'repairs'
  : 'pricing';

// 3. NavLink 사용 (자동 활성화)
import { NavLink } from 'react-router-dom';

<NavLink to="/admin/services" className="...">
  Services
</NavLink>
```

**우선순위**: 6

---

### 8. 정렬 기능 누락
**파일**: 모든 페이지

**문제점**:
```tsx
{/* 테이블에 정렬 기능 없음 */}
<table className="w-full">
  {/* 정렬 버튼 없음 */}
</table>
```

**해결 방안**:
```typescript
// 1. Table 헤더에 정렬 기능 추가
const [sortBy, setSortBy] = useState('created_at');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

const handleSort = (field: string) => {
  if (sortBy === field) {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    setSortBy(field);
    setSortOrder('desc');
  }
};

// 2. 정렬된 데이터 표시
const sortedServices = [...services].sort((a, b) => {
  const aVal = a[sortBy as keyof typeof a];
  const bVal = b[sortBy as keyof typeof b];
  
  if (sortOrder === 'asc') {
    return aVal > bVal ? 1 : -1;
  } else {
    return aVal < bVal ? 1 : -1;
  }
});

// 3. 정렬 아이콘 표시
const sortIcon = sortOrder === 'asc' ? ChevronUp : ChevronDown;

<th className="cursor-pointer" onClick={() => handleSort('created_at')}>
  생성일 {sortIcon}
</th>
```

**우선순위**: 7

---

### 9. 페이지네이션 없음
**파일**: 모든 페이지

**문제점**:
```tsx
{/* 수리 신청 100건이 있어도 1페이지에 표시 */}
<div>
  {/* 페이지네이션 없음 */}
  {repairs.map((repair) => (
    <tr>...</tr>
  ))}
</div>
```

**해결 방안**:
```typescript
// 1. 페이지네이션 컴포넌트 추가
interface PaginationProps {
  total: number;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ total, currentPage, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="..."
      >
        이전
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? 'bg-black text-white' : 'bg-white'}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="..."
      >
        다음
      </button>
    </div>
  );
}

// 2. RepairsPage에 통합
const [currentPage, setCurrentPage] = useState(1);
const perPage = 10;

const paginatedRepairs = repairs.slice(
  (currentPage - 1) * perPage,
  currentPage * perPage
);
```

**우선순위**: 8

---

### 10. 에러 처리 표준화 부족
**파일**: 모든 페이지

**문제점**:
```typescript
// 에러 처리가 일관되지 않음
try {
  await loadServices();
} catch (error) {
  console.error('Failed to load services:', error);
  alert('서비스 삭제에 실패했습니다.'); // 일관되지 않음
}
```

**해결 방안**:
```typescript
// 1. 에러 핸들러 통합
const handleApiError = (error: unknown, context: string) => {
  console.error(`${context}:`, error);
  
  if (error instanceof Error) {
    toast.error(`${context}: ${error.message}`);
  } else {
    toast.error(`${context}: 알 수 없는 오류가 발생했습니다.`);
  }
};

// 2. 사용
await loadServices(); // 에러 핸들러에서 처리

// 3. Sentry로 에러 로그 전송 (선택사항)
import * as Sentry from '@sentry/react';

Sentry.captureException(error, {
  contexts: {
    page: window.location.pathname,
  },
});
```

**우선순위**: 9

---

## 🟢 Low Priority (점진적 개선)

### 11. 리뷰 관리 페이지 미구현
**파일**: `src/admin/AdminApp.tsx`

**문제점**:
```typescript
// 리뷰 페이지가 텍스트만 있음
<Route path="reviews" element={
  <div className="text-center py-12 text-gray-600">리뷰 관리 페이지 (개발 예정)</div>
} />
```

**해결 방안**:
```typescript
// 1. ReviewsPage.tsx 생성
export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    
    setReviews(data || []);
    setLoading(false);
  };

  // 리뷰 승인/거부 기능
  const toggleApproval = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      await supabase
        .from('reviews')
        .update({ is_approved: !review.is_approved })
        .eq('id', reviewId);
      
      await loadReviews();
    }
  };

  return (
    <div>
      {/* 리뷰 목록 테이블 */}
      {/* 승인/거부 버튼 */}
    </div>
  );
}
```

**우선순위**: 10

---

### 12. 가격 대량 업데이트 기능 없음
**파일**: `src/admin/pages/PricingPage.tsx`

**문제점**:
```typescript
// 가격 변경 시 하나씩만 저장됨
const updatePrice = (serviceId: string, price: number) => {
  // ... 기존 코드
  setPricingData(new Map(pricingData).set(serviceId, updated));
};
```

**해결 방안**:
```typescript
// 1. 대량 저장 기능 추가
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [bulkPrice, setBulkPrice] = useState<number | null>(null);

const handleBulkUpdate = async (price: number) => {
  try {
    const updates = services.map(svc => ({
      service_id: svc.service_id,
      price: bulkPrice || price,
      is_available: true,
    }));

    await supabase
      .from('controller_service_pricing')
      .upsert(updates);
    
    toast.success(`${updates.length}개 가격이 업데이트되었습니다.`);
    await loadPricingData(selectedController);
  } catch (error) {
    toast.error('대량 업데이트에 실패했습니다.');
  }
};

// 2. UI: 대량 설정 모달
<Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
  <DialogContent>
    <DialogTitle>대량 가격 설정</DialogTitle>
    <div className="space-y-4">
      <div>
        <Label>새 가격</Label>
        <Input 
          type="number"
          value={bulkPrice}
          onChange={(e) => setBulkPrice(Number(e.target.value))}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleBulkUpdate(bulkPrice!)}>
          모든 서비스에 적용
        </Button>
        <Button onClick={() => handleBulkUpdate(0)}>
          모든 서비스 해제
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

**우선순위**: 11

---

### 13. 컨트롤러 관리 필터 UX 개선
**파일**: `src/admin/pages/ControllersPage.tsx`

**문제점**:
```typescript
// 필터가 없음 (활성/비활성만 표시)
const [controllers, setControllers] = useState<ControllerModel[]>([]);
```

**해결 방안**:
```typescript
// 1. 상태 필터 추가
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

const filteredControllers = controllers.filter(c => {
  if (statusFilter === 'active') return c.is_active;
  if (statusFilter === 'inactive') return !c.is_active;
  return true;
});

// 2. UI: 필터 버튼
<div className="flex gap-2 mb-4">
  <button onClick={() => setStatusFilter('all')}>
    전체 ({controllers.length})
  </button>
  <button onClick={() => setStatusFilter('active')}>
    활성 ({controllers.filter(c => c.is_active).length})
  </button>
  <button onClick={() => setStatusFilter('inactive')}>
    비활성 ({controllers.filter(c => !c.is_active).length})
  </button>
</div>
```

**우선순위**: 12

---

## 📋 구현 우선순위

### 단계 1: 보안 및 UX (즉시)
1. 인증 시스템 개선 (Supabase Row Level Security)
2. alert() → Toast로 교체 (전역)
3. 서비스 추가 모달 구현
4. 로딩 상태 표시 개선

### 단계 2: 반응형 및 데이터 (주간)
5. 모바일 반응형 사이드바
6. 대시보드 실시간 업데이트
7. 네비게이션 경로 일치
8. 페이지네이션 추가

### 단계 3: 기능 개선 (월간)
9. 정렬 기능 추가
10. 에러 처리 표준화
11. 리뷰 관리 페이지 구현
12. 가격 대량 업데이트
13. 컨트롤러 필터 개선

---

## 📂 관련 파일

| 파일 | 용도 |
|------|------|
| `src/admin/AdminApp.tsx` | 메인 앱 컴포넌트 |
| `src/admin/contexts/AuthContext.tsx` | 인증 컨텍스트 |
| `src/admin/components/AdminLayout.tsx` | 레이아웃 |
| `src/admin/components/LoginPage.tsx` | 로그인 페이지 |
| `src/admin/pages/Dashboard.tsx` | 대시보드 |
| `src/admin/pages/ServicesPage.tsx` | 서비스 관리 |
| `src/admin/pages/ControllersPage.tsx` | 컨트롤러 관리 |
| `src/admin/pages/PricingPage.tsx` | 가격 설정 |
| `src/admin/pages/RepairsPage.tsx` | 수리 신청 관리 |

---

## 🚀 빠른 시작 가이드

### 인증 개선
```bash
# 1. Supabase Row Level Security 활성화
# Supabase Dashboard → Authentication → Policies → Create Policy
# Policy Name: Admin users only
# Operation: SELECT, INSERT, UPDATE, DELETE
# Target: admin_users
# Expression: auth.uid() = id

# 2. admin_users 테이블 생성
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

# 3. 첫 번 관리자 계정 생성
INSERT INTO admin_users (email, password_hash)
VALUES ('admin@pandaduck.com', '$2b$12$your_hashed_password');
```

### Toast 설정 (이미 설치됨)
```typescript
// App 컴포넌트 감싸기
import { Toaster } from 'sonner';

export function AdminApp() {
  return (
    <AuthProvider>
      <AdminContent />
      <Toaster />
    </AuthProvider>
  );
}
```

### 정렬 컴포넌트 생성
```bash
# src/admin/components/TableHeader.tsx 생성
interface TableHeaderProps {
  title: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function TableHeader({ title, sortBy, sortOrder, onSort }: TableHeaderProps) {
  const sortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown;
  
  return (
    <th 
      className="cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(sortBy)}
    >
      <div className="flex items-center gap-2">
        <span>{title}</span>
        <sortIcon className="w-4 h-4" />
      </div>
    </th>
  );
}
```

---

**문서 생성일**: 2026-01-22
**버전**: 1.0.0
