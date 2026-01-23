import { Menu, Zap, CircuitBoard, Plus, Battery, Wrench, Palette } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuDrawer } from "@/app/components/MenuDrawer";
import { ServiceDetailModal } from "@/app/components/ServiceDetailModal";
import { useServices } from "@/hooks/useServices";
import type { ServiceOption } from "@/types/database";

// Icon mapping helper
const iconMap: Record<string, React.ReactNode> = {
  'hall-effect': <Zap className="w-6 h-6" />,
  'clicky-buttons': <CircuitBoard className="w-6 h-6" />,
  'back-buttons': <Plus className="w-6 h-6" />,
  'battery': <Battery className="w-6 h-6" />,
  'hair-trigger': <Wrench className="w-6 h-6" />,
  'custom-shell': <Palette className="w-6 h-6" />,
};

interface ServiceDetail {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  process: string[];
  price: string;
  duration: string;
  warranty: string;
  image?: string;
}

export function ServicesPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const { services, loading } = useServices();

  const handleInfoClick = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const service = services.find(s => s.service_id === serviceId);
    if (service) {
      // Transform database service to ServiceDetail format
      const serviceDetail = {
        id: service.service_id,
        icon: iconMap[service.service_id] || <Zap className="w-6 h-6" />,
        title: service.name,
        subtitle: service.subtitle || '',
        description: service.detailed_description || service.description,
        features: service.features || [],
        process: service.process_steps || [],
        price: `₩${service.base_price.toLocaleString()}`,
        duration: service.duration || '1일',
        warranty: service.warranty || '1년',
        image: service.image_url,
      };
      setSelectedService(serviceDetail);
    }
  };

  const handleBookService = () => {
    setSelectedService(null);
    navigate('/services');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-lg tracking-tight"
            style={{ fontWeight: 600 }}
          >
            PandaDuck Fix
          </button>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Hero */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-8">
        <h1 className="text-4xl mb-4" style={{ fontWeight: 700 }}>
          제공 서비스
        </h1>
        <p className="text-lg text-[#86868B]">
          프로게이머와 열정적인 게이머를 위한<br />
          최고 품질의 커스터마이징 서비스
        </p>
      </section>

      {/* Services Grid */}
      <section className="max-w-md mx-auto px-6 pb-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#86868B] border-t-black rounded-full animate-spin"></div>
            <p className="mt-4 text-[#86868B]">서비스 정보를 불러오는 중...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {services.map((service, _index) => {
              // Supabase 데이터인지 로컬 데이터인지 확인
              const isSupabaseData = 'service_id' in service;

              const features = isSupabaseData
                ? (Array.isArray(service.features)
                    ? service.features
                    : typeof service.features === 'string'
                      ? JSON.parse(service.features)
                      : [])
                : service.features;

              const serviceId = isSupabaseData ? service.service_id : service.id;
              const serviceName = service.name;
              const serviceDescription = service.description;
              const servicePrice = isSupabaseData ? service.base_price.toLocaleString() + '원' : service.price;
              const serviceOptions = isSupabaseData ? service.options : service.options;

              return (
                <div
                  key={isSupabaseData ? service.id : service.id}
                  className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      {isSupabaseData ? (iconMap[service.service_id] || <Zap className="w-6 h-6" />) : service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                        {serviceName}
                      </h3>
                      <p className="text-sm text-[#86868B] mb-3">
                        {serviceDescription}
                      </p>
                      <div className="text-xl mb-3" style={{ fontWeight: 700 }}>
                        {servicePrice}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {features.slice(0, 3).map((feature: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white rounded-full text-xs"
                            style={{ fontWeight: 600 }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Options */}
                      {serviceOptions && serviceOptions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.1)]">
                          <p className="text-sm mb-3" style={{ fontWeight: 600 }}>
                            선택 옵션
                          </p>
                          <div className="space-y-2">
                            {serviceOptions.map((option: ServiceOption, i: number) => (
                              <div
                                key={isSupabaseData ? option.id : i}
                                className="bg-white rounded-[16px] p-3 flex items-center justify-between"
                              >
                                <div>
                                  <div className="text-sm" style={{ fontWeight: 600 }}>
                                    {isSupabaseData ? option.option_name : option.name}
                                  </div>
                                  <div className="text-xs text-[#86868B]">
                                    {isSupabaseData ? option.option_description : option.description}
                                  </div>
                                </div>
                                <div className="text-sm" style={{ fontWeight: 700 }}>
                                  {isSupabaseData
                                    ? (option.additional_price === 0 ? '기본' : `+${option.additional_price.toLocaleString()}원`)
                                    : (option.price === 0 ? '기본' : `+${option.price.toLocaleString()}원`)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleInfoClick(serviceId, e)}
                    className="w-full bg-[#000000] text-white py-2 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-4"
                    style={{ fontWeight: 600 }}
                  >
                    상세 정보
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-12">
        <div className="bg-[#000000] text-white rounded-[28px] p-8 text-center space-y-4">
          <h3 className="text-2xl" style={{ fontWeight: 700 }}>
            지금 바로 시작하세요
          </h3>
          <p className="text-[#86868B]">
            전문가의 손길로 완벽하게 커스터마이징된<br />
            나만의 컨트롤러를 만나보세요
          </p>
          <button
            onClick={() => navigate('/services')}
            className="w-full bg-white text-black py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-6"
            style={{ fontWeight: 600 }}
          >
            수리 신청하기
          </button>
        </div>
      </section>

      <Footer />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        onBookService={handleBookService}
      />
    </div>
  );
}