import { useEffect, useState } from 'react';
import { getControllerModels } from '@/services/pricingService';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import type { ControllerModel } from '@/types/database';

export function ControllersPage() {
  const [controllers, setControllers] = useState<ControllerModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadControllers();
  }, []);

  const loadControllers = async () => {
    try {
      const data = await getControllerModels();
      setControllers(data);
    } catch (error) {
      console.error('Failed to load controllers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleControllerStatus = async (controllerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('controller_models')
        .update({ is_active: !currentStatus })
        .eq('id', controllerId);

      if (error) throw error;
      await loadControllers();
    } catch (error) {
      console.error('Failed to toggle controller status:', error);
      alert('컨트롤러 상태 변경에 실패했습니다.');
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
        <h1 className="text-3xl font-bold">컨트롤러 모델 관리</h1>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          <Plus className="w-5 h-5" />
          모델 추가
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">순서</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">모델명</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">설명</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {controllers.map((controller) => (
              <tr key={controller.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                  {controller.display_order}
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{controller.model_name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                  {controller.model_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {controller.description || '-'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleControllerStatus(controller.id, controller.is_active)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      controller.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {controller.is_active ? (
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
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {controllers.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            등록된 컨트롤러 모델이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
