import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Users, Wrench, Star } from 'lucide-react';

interface Stats {
  totalRepairs: number;
  pendingRepairs: number;
  totalServices: number;
  averageRating: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRepairs: 0,
    pendingRepairs: 0,
    totalServices: 0,
    averageRating: 0,
  });
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

      // 서비스 개수
      const { count: totalServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // 평균 평점
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('is_approved', true);

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      setStats({
        totalRepairs: totalRepairs || 0,
        pendingRepairs: pendingRepairs || 0,
        totalServices: totalServices || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: '전체 수리 신청',
      value: stats.totalRepairs,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: '대기 중인 신청',
      value: stats.pendingRepairs,
      icon: Users,
      color: 'yellow',
    },
    {
      label: '활성 서비스',
      value: stats.totalServices,
      icon: Wrench,
      color: 'green',
    },
    {
      label: '평균 평점',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
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
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4">최근 활동</h2>
        <p className="text-gray-600">최근 수리 신청 및 리뷰 내역이 여기 표시됩니다.</p>
      </div>
    </div>
  );
}
