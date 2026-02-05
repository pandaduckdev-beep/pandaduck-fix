import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Users, Wrench, Star, CheckCircle, Clock, XCircle, Package, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalRepairs: number;
  pendingRepairs: number;
  confirmedRepairs: number;
  inProgressRepairs: number;
  completedRepairs: number;
  cancelledRepairs: number;
  monthlyRevenue: number;
  monthlyCompletedRepairs: number;
  currentMonth: string;
  averageRating: number;
  totalReviews: number;
}

interface RecentRepair {
  id: string;
  customer_name: string;
  controller_model: string;
  controller_models?: {
    model_name: string;
  };
  status: string;
  created_at: string;
  total_amount: number;
}

interface RecentReview {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_public: boolean;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalRepairs: 0,
    pendingRepairs: 0,
    confirmedRepairs: 0,
    inProgressRepairs: 0,
    completedRepairs: 0,
    cancelledRepairs: 0,
    monthlyRevenue: 0,
    monthlyCompletedRepairs: 0,
    currentMonth: '',
    averageRating: 0,
    totalReviews: 0,
  });
  const [recentRepairs, setRecentRepairs] = useState<RecentRepair[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // 수리 신청 통계
      const { count: totalRepairs } = await supabase
        .from('repair_requests')
        .select('*', { count: 'exact', head: true });

      const { count: pendingRepairs } = await supabase
        .from('repair_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: confirmedRepairs } = await supabase
        .from('repair_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');

      const { count: inProgressRepairs } = await supabase
        .from('repair_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      const { count: completedRepairs } = await supabase
        .from('repair_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: cancelledRepairs } = await supabase
        .from('repair_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      // 현재 월 계산
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // 이번 달 매출 계산 (완료된 수리의 총 금액)
      const { data: monthlyCompletedRepairsData } = await supabase
        .from('repair_requests')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', firstDayOfMonth)
        .lte('created_at', lastDayOfMonth);

      const monthlyRevenue = monthlyCompletedRepairsData?.reduce((sum, repair) => {
        const price = Number(repair.total_amount);
        return sum + (isNaN(price) ? 0 : price);
      }, 0) || 0;

      const monthlyCompletedRepairs = monthlyCompletedRepairsData?.length || 0;

      // 평균 평점 및 리뷰 수 (공개된 리뷰 기준)
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('is_public', true);

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // 최근 수리 신청 (최근 5개)
      const { data: repairs } = await supabase
        .from('repair_requests')
        .select(`
          *,
          controller_models!repair_requests_controller_model_fkey (
            model_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // 최근 리뷰 (최근 5개)
      const { data: recentReviewsData } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalRepairs: totalRepairs || 0,
        pendingRepairs: pendingRepairs || 0,
        confirmedRepairs: confirmedRepairs || 0,
        inProgressRepairs: inProgressRepairs || 0,
        completedRepairs: completedRepairs || 0,
        cancelledRepairs: cancelledRepairs || 0,
        monthlyRevenue,
        monthlyCompletedRepairs,
        currentMonth: `${now.getMonth() + 1}월`,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews?.length || 0,
      });

      setRecentRepairs(repairs || []);
      setRecentReviews(recentReviewsData || []);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusFlow = [
    {
      label: '대기중',
      value: stats.pendingRepairs,
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    },
    {
      label: '확인됨',
      value: stats.confirmedRepairs,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: '진행중',
      value: stats.inProgressRepairs,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      label: '완료',
      value: stats.completedRepairs,
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      label: '취소',
      value: stats.cancelledRepairs,
      color: 'bg-red-50 text-red-600 border-red-200',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const statusBadgeClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: '대기중',
    confirmed: '확인됨',
    in_progress: '진행중',
    completed: '완료',
    cancelled: '취소',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">대시보드</h1>
          <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            전체 {stats.totalRepairs}건
          </div>
        </div>
        <div className="text-sm text-gray-600">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </div>
      </div>

      {/* 매출 & 평점 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 예상 매출 */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">{stats.currentMonth} 예상 매출</h3>
          </div>
          <p className="text-4xl font-bold mb-1">₩{stats.monthlyRevenue.toLocaleString()}</p>
          <p className="text-sm text-blue-100">이번 달 완료된 {stats.monthlyCompletedRepairs}건의 수리 금액</p>
        </div>

        {/* 평균 평점 */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">고객 만족도</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</p>
            <p className="text-xl text-orange-100">/ 5.0</p>
          </div>
          <p className="text-sm text-orange-100">총 {stats.totalReviews}개의 승인된 리뷰</p>
        </div>
      </div>

      {/* 수리 상태 플로우 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h2 className="text-xl font-bold mb-4">수리 진행 현황</h2>
        <div className="flex items-center justify-between gap-2">
          {statusFlow.map((status, index) => (
            <div key={status.label} className="flex items-center flex-1">
              <div className={`flex-1 border-2 rounded-lg p-4 ${status.color} transition hover:shadow-md`}>
                <p className="text-sm font-medium mb-1">{status.label}</p>
                <p className="text-3xl font-bold">{status.value}</p>
              </div>
              {index < statusFlow.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 최근 수리 신청 및 리뷰 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 수리 신청 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">최근 수리 신청</h2>
              <p className="text-sm text-gray-500 mt-1">최근 5개 신청 건</p>
            </div>
            <button
              onClick={() => navigate('/admin/repairs')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              전체 보기 →
            </button>
          </div>

          {recentRepairs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>수리 신청 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRepairs.map((repair) => (
                <div
                  key={repair.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-sm transition cursor-pointer border border-transparent hover:border-gray-200"
                  onClick={() => navigate('/admin/repairs')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900 truncate">{repair.customer_name}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          statusBadgeClasses[repair.status as keyof typeof statusBadgeClasses]
                        }`}
                      >
                        {statusLabels[repair.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {repair.controller_models?.model_name || repair.controller_model}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(repair.created_at)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                      ₩{(repair.total_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 리뷰 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">최근 리뷰</h2>
              <p className="text-sm text-gray-500 mt-1">승인 대기 우선 표시</p>
            </div>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              전체 보기 →
            </button>
          </div>

          {recentReviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-sm transition cursor-pointer border border-transparent hover:border-gray-200"
                  onClick={() => navigate('/admin/reviews')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{review.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
