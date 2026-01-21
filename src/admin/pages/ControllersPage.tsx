import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Check, X } from 'lucide-react';
import type { ControllerModel } from '@/types/database';

interface ControllerFormData {
  model_name: string;
  model_id: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export function ControllersPage() {
  const [controllers, setControllers] = useState<ControllerModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingController, setEditingController] = useState<ControllerModel | null>(null);
  const [formData, setFormData] = useState<ControllerFormData>({
    model_name: '',
    model_id: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadControllers();
  }, []);

  const loadControllers = async () => {
    try {
      // 현재 인증 상태 확인
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('User authenticated:', !!user);

      // 관리자 페이지에서는 모든 컨트롤러를 조회 (비활성 포함)
      const { data, error } = await supabase
        .from('controller_models')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Loaded controllers:', data);
      console.log('Total controllers:', data?.length);
      console.log('Active controllers:', data?.filter(c => c.is_active).length);
      console.log('Inactive controllers:', data?.filter(c => !c.is_active).length);
      setControllers(data || []);
    } catch (error) {
      console.error('Failed to load controllers:', error);
      alert(`컨트롤러 로딩 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleControllerStatus = async (controllerId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling status:', { controllerId, currentStatus, newStatus: !currentStatus });

      // 인증 상태 확인
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User during toggle:', user?.id, user?.email);

      const { data, error } = await supabase
        .from('controller_models')
        .update({ is_active: !currentStatus })
        .eq('id', controllerId)
        .select();

      if (error) {
        console.error('Toggle error:', error);
        console.error('Toggle error code:', error.code);
        console.error('Toggle error message:', error.message);
        console.error('Toggle error details:', error.details);
        throw error;
      }

      console.log('Toggle result:', data);
      alert(`상태가 ${!currentStatus ? '활성' : '비활성'}으로 변경되었습니다.`);
      await loadControllers();
    } catch (error) {
      console.error('Failed to toggle controller status:', error);
      alert(`컨트롤러 상태 변경에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const openAddModal = () => {
    setEditingController(null);
    setFormData({
      model_name: '',
      model_id: '',
      description: '',
      display_order: controllers.length + 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (controller: ControllerModel) => {
    setEditingController(controller);
    setFormData({
      model_name: controller.model_name,
      model_id: controller.model_id,
      description: controller.description || '',
      display_order: controller.display_order,
      is_active: controller.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingController(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 인증 상태 확인
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User during submit:', user?.id, user?.email);

      if (editingController) {
        // 수정
        console.log('Updating controller:', editingController.id, formData);
        const { data, error } = await supabase
          .from('controller_models')
          .update({
            model_name: formData.model_name,
            description: formData.description,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .eq('id', editingController.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          console.error('Update error code:', error.code);
          console.error('Update error message:', error.message);
          throw error;
        }
        console.log('Update result:', data);
        alert('컨트롤러가 수정되었습니다.');
      } else {
        // 추가
        console.log('Inserting controller:', formData);
        const { data, error } = await supabase
          .from('controller_models')
          .insert({
            model_name: formData.model_name,
            model_id: formData.model_id,
            description: formData.description,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          console.error('Insert error code:', error.code);
          console.error('Insert error message:', error.message);
          throw error;
        }
        console.log('Insert result:', data);
        alert('컨트롤러가 추가되었습니다.');
      }

      closeModal();
      await loadControllers();
    } catch (error) {
      console.error('Failed to save controller:', error);
      alert(`컨트롤러 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
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
                      onClick={() => openEditModal(controller)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {editingController ? '컨트롤러 수정' : '컨트롤러 추가'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  모델명 *
                </label>
                <input
                  type="text"
                  value={formData.model_name}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="예: DualSense"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  모델 ID * {editingController && '(수정 불가)'}
                </label>
                <input
                  type="text"
                  value={formData.model_id}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  required
                  disabled={!!editingController}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none disabled:bg-gray-100"
                  placeholder="예: dualsense"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="컨트롤러 설명"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  표시 순서
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">활성화</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  {editingController ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
