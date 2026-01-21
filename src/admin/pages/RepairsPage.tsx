import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Eye, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import { getControllerModelName } from '@/utils/controllerModels';
import type { RepairRequest, Service, ServiceOption } from '@/types/database';

interface ServiceWithDetails {
  service_id: string;
  selected_option_id: string | null;
  service_price: number;
  option_price: number;
  service?: Service;
  option?: ServiceOption;
}

interface RepairRequestWithServices extends RepairRequest {
  services?: ServiceWithDetails[];
}

type RepairStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<RepairStatus, { label: string; color: string; icon: any }> = {
  pending: { label: '대기중', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: '확인됨', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  in_progress: { label: '진행중', color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export function RepairsPage() {
  const [repairs, setRepairs] = useState<RepairRequestWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all');
  const [selectedRepair, setSelectedRepair] = useState<RepairRequestWithServices | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadRepairs();
  }, []);

  const loadRepairs = async () => {
    try {
      let query = supabase
        .from('repair_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: repairRequests, error } = await query;

      if (error) throw error;

      // 각 수리 신청에 대한 서비스 목록 조회
      const repairsWithServices = await Promise.all(
        (repairRequests || []).map(async (repair) => {
          const { data: services } = await supabase
            .from('repair_request_services')
            .select(`
              service_id,
              selected_option_id,
              service_price,
              option_price
            `)
            .eq('repair_request_id', repair.id);

          // 서비스 상세 정보 조회
          const servicesWithDetails = await Promise.all(
            (services || []).map(async (svc) => {
              const { data: service } = await supabase
                .from('services')
                .select('*')
                .eq('id', svc.service_id)
                .single();

              let option = null;
              if (svc.selected_option_id) {
                const { data: opt } = await supabase
                  .from('service_options')
                  .select('*')
                  .eq('id', svc.selected_option_id)
                  .single();
                option = opt;
              }

              return {
                ...svc,
                service,
                option,
              };
            })
          );

          return {
            ...repair,
            services: servicesWithDetails,
          };
        })
      );

      setRepairs(repairsWithServices);
    } catch (error) {
      console.error('Failed to load repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, [statusFilter]);

  const filteredRepairs = repairs.filter(repair => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      repair.customer_name.toLowerCase().includes(search) ||
      repair.customer_phone.includes(search) ||
      repair.controller_model.toLowerCase().includes(search)
    );
  });

  const loadRepairDetail = async (repairId: string) => {
    setLoadingDetail(true);
    try {
      // 수리 신청 기본 정보 조회
      const { data: repair, error: repairError } = await supabase
        .from('repair_requests')
        .select('*')
        .eq('id', repairId)
        .single();

      if (repairError) throw repairError;

      // 선택한 서비스들 조회
      const { data: services, error: servicesError } = await supabase
        .from('repair_request_services')
        .select(`
          service_id,
          selected_option_id,
          service_price,
          option_price
        `)
        .eq('repair_request_id', repairId);

      if (servicesError) throw servicesError;

      // 각 서비스의 상세 정보 조회
      const servicesWithDetails = await Promise.all(
        (services || []).map(async (svc) => {
          const { data: service } = await supabase
            .from('services')
            .select('*')
            .eq('id', svc.service_id)
            .single();

          let option = null;
          if (svc.selected_option_id) {
            const { data: opt } = await supabase
              .from('service_options')
              .select('*')
              .eq('id', svc.selected_option_id)
              .single();
            option = opt;
          }

          return {
            ...svc,
            service,
            option,
          };
        })
      );

      setSelectedRepair({
        ...repair,
        services: servicesWithDetails,
      });
    } catch (error) {
      console.error('Failed to load repair detail:', error);
      alert('상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const updateStatus = async (repairId: string, newStatus: RepairStatus) => {
    try {
      const { error } = await supabase
        .from('repair_requests')
        .update({ status: newStatus })
        .eq('id', repairId);

      if (error) throw error;
      await loadRepairs();

      // 상세보기가 열려있으면 업데이트
      if (selectedRepair?.id === repairId) {
        await loadRepairDetail(repairId);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경에 실패했습니다.');
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
        <h1 className="text-3xl font-bold">수리 신청 관리</h1>
        <div className="text-sm text-gray-600">
          총 <span className="font-semibold text-black">{repairs.length}</span>건
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 space-y-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="고객명, 전화번호, 컨트롤러 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RepairStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
          >
            <option value="all">전체 상태</option>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">고객 정보</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">컨트롤러</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">신청 서비스</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">금액</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">신청일</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRepairs.map((repair) => {
              const statusConfig = STATUS_CONFIG[repair.status as RepairStatus];
              const StatusIcon = statusConfig?.icon;

              return (
                <tr key={repair.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{repair.customer_name}</div>
                      <div className="text-sm text-gray-600">{repair.customer_phone}</div>
                      {repair.customer_email && (
                        <div className="text-sm text-gray-600">{repair.customer_email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                      {getControllerModelName(repair.controller_model)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {repair.services?.map((svc, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-gray-900">{svc.service?.name}</span>
                          {svc.option && (
                            <span className="text-gray-500 text-xs ml-1">
                              ({svc.option.option_name})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    ₩{repair.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                      {StatusIcon && <StatusIcon className="w-4 h-4" />}
                      {statusConfig?.label || repair.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(repair.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadRepairDetail(repair.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="상세보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <select
                        value={repair.status}
                        onChange={(e) => updateStatus(repair.id, e.target.value as RepairStatus)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      >
                        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                          <option key={value} value={value}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRepairs.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            {searchTerm ? '검색 결과가 없습니다.' : '수리 신청이 없습니다.'}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRepair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">수리 신청 상세</h2>
              <button
                onClick={() => setSelectedRepair(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">고객 정보</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">이름</span>
                      <span className="font-semibold">{selectedRepair.customer_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">전화번호</span>
                      <span className="font-semibold">{selectedRepair.customer_phone}</span>
                    </div>
                    {selectedRepair.customer_email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">이메일</span>
                        <span className="font-semibold">{selectedRepair.customer_email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">컨트롤러</span>
                      <span className="font-semibold">{getControllerModelName(selectedRepair.controller_model)}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">선택한 서비스</h3>
                  <div className="space-y-3">
                    {selectedRepair.services?.map((svc, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{svc.service?.name}</span>
                          <span className="font-semibold">₩{svc.service_price.toLocaleString()}</span>
                        </div>
                        {svc.option && (
                          <div className="flex items-center justify-between text-sm pl-4">
                            <span className="text-gray-600">ㄴ {svc.option.option_name}</span>
                            <span className="text-gray-900 font-medium">
                              {svc.option_price === 0 ? '기본' : `+₩${svc.option_price.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issue Description */}
                {selectedRepair.issue_description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">추가 정보</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRepair.issue_description}</p>
                    </div>
                  </div>
                )}

                {/* Total & Status */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">총 금액</span>
                    <span className="text-2xl font-bold">₩{selectedRepair.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">상태 변경</span>
                    <select
                      value={selectedRepair.status}
                      onChange={(e) => updateStatus(selectedRepair.id, e.target.value as RepairStatus)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    >
                      {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="border-t border-gray-200 pt-4 text-sm text-gray-600 space-y-1">
                  <div>신청일: {new Date(selectedRepair.created_at).toLocaleString('ko-KR')}</div>
                  {selectedRepair.estimated_completion_date && (
                    <div>예상 완료일: {new Date(selectedRepair.estimated_completion_date).toLocaleString('ko-KR')}</div>
                  )}
                  {selectedRepair.actual_completion_date && (
                    <div>실제 완료일: {new Date(selectedRepair.actual_completion_date).toLocaleString('ko-KR')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
