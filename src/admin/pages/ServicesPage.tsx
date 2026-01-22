import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import type { Service, ServiceOption } from '@/types/database';
import { toast } from 'sonner';
import { AddServiceModal } from '../components/AddServiceModal';

interface ServiceWithOptions extends Service {
  options?: ServiceOption[];
}

export function ServicesPage() {
  const [services, setServices] = useState<ServiceWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, service_options(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;
      await loadServices();
      toast.success('서비스 상태가 변경되었습니다.');
    } catch (error) {
      console.error('Failed to toggle service status:', error);
      toast.error('서비스 상태 변경에 실패했습니다.');
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('정말 이 서비스를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      await loadServices();
      toast.success('서비스가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('서비스 삭제에 실패했습니다.');
    }
  };

  const handleAddService = (service: Omit<Service, 'id'>) => {
    return new Promise(async (resolve) => {
      const { error } = await supabase
        .from('services')
        .insert(service);

      if (error) throw error;
      resolve();
    });
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
        <h1 className="text-3xl font-bold">서비스 관리</h1>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          서비스 추가
        </button>
      </div>

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (service) => {
          await handleAddService(service);
          toast.success('서비스가 추가되었습니다.');
        }}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">서비스명</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">기본 가격</th>
              <th className="px-6 py-4 hered text-left text-sm font-semibold text-gray-900">옵션 수</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-600">{service.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                  {service.service_id}
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  ₩{service.base_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {service.options?.length || 0}개
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleServiceStatus(service.id, service.is_active)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      service.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.is_active ? (
                      <>
                        <Check className="w-4 h-4" />
                        활성
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        비활성
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleServiceStatus(service.id, service.is_active)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="활성/비활성"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {services.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            등록된 서비스가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
