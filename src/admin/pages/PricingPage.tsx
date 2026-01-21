import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, DollarSign } from 'lucide-react';
import type { ControllerModel, Service } from '@/types/database';

interface PricingData {
  controller_model_id: string;
  service_id: string;
  price: number;
  is_available: boolean;
}

export function PricingPage() {
  const [controllers, setControllers] = useState<ControllerModel[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pricingData, setPricingData] = useState<Map<string, PricingData>>(new Map());
  const [selectedController, setSelectedController] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedController) {
      loadPricingData(selectedController);
    }
  }, [selectedController]);

  const loadData = async () => {
    try {
      // 모든 활성 컨트롤러 조회
      const { data: controllerData } = await supabase
        .from('controller_models')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      setControllers(controllerData || []);
      setServices(serviceData || []);

      if (controllerData && controllerData.length > 0) {
        setSelectedController(controllerData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPricingData = async (controllerId: string) => {
    try {
      const { data, error } = await supabase
        .from('controller_service_pricing')
        .select('*')
        .eq('controller_model_id', controllerId);

      if (error) throw error;

      const priceMap = new Map<string, PricingData>();
      data?.forEach(item => {
        priceMap.set(item.service_id, item);
      });

      setPricingData(priceMap);
    } catch (error) {
      console.error('Failed to load pricing data:', error);
    }
  };

  const updatePrice = (serviceId: string, price: number) => {
    const existing = pricingData.get(serviceId);
    const updated = {
      controller_model_id: selectedController,
      service_id: serviceId,
      price,
      is_available: existing?.is_available ?? true,
    };
    setPricingData(new Map(pricingData).set(serviceId, updated));
  };

  const toggleAvailability = (serviceId: string) => {
    const existing = pricingData.get(serviceId);
    const service = services.find(s => s.id === serviceId);
    const updated = {
      controller_model_id: selectedController,
      service_id: serviceId,
      price: existing?.price ?? service?.base_price ?? 0,
      is_available: !(existing?.is_available ?? true),
    };
    setPricingData(new Map(pricingData).set(serviceId, updated));
  };

  const savePricing = async () => {
    if (!selectedController) return;

    setSaving(true);
    try {
      const updates = Array.from(pricingData.values());

      if (updates.length === 0) {
        alert('저장할 변경사항이 없습니다.');
        setSaving(false);
        return;
      }

      // Upsert pricing data - Supabase는 unique constraint에 따라 자동으로 upsert됨
      const { error } = await supabase
        .from('controller_service_pricing')
        .upsert(updates, {
          onConflict: 'controller_model_id, service_id'
        });

      if (error) throw error;

      alert('가격 설정이 저장되었습니다.');
      await loadPricingData(selectedController);
    } catch (error) {
      console.error('Failed to save pricing:', error);
      alert(`가격 설정 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedControllerName = controllers.find(c => c.id === selectedController)?.model_name;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">가격 설정</h1>
        <button
          onClick={savePricing}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>

      {/* Controller Selector */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          컨트롤러 모델 선택
        </label>
        <select
          value={selectedController}
          onChange={(e) => setSelectedController(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
        >
          {controllers.map(controller => (
            <option key={controller.id} value={controller.id}>
              {controller.model_name}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {selectedControllerName} 서비스 가격
          </h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">서비스명</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">기본 가격</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">설정 가격</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">제공 여부</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => {
              const pricing = pricingData.get(service.id);
              const currentPrice = pricing?.price ?? service.base_price;
              const isAvailable = pricing?.is_available ?? true;

              return (
                <tr key={service.id} className={`hover:bg-gray-50 ${!isAvailable ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-600">{service.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    ₩{service.base_price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={currentPrice}
                        onChange={(e) => updatePrice(service.id, parseInt(e.target.value) || 0)}
                        disabled={!isAvailable}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none disabled:bg-gray-100"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={() => toggleAvailability(service.id)}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {isAvailable ? '제공' : '미제공'}
                      </span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
