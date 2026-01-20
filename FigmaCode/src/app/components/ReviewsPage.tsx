import { Menu, Star } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useState } from "react";
import { MenuDrawer } from "@/app/components/MenuDrawer";

interface ReviewsPageProps {
  onNavigate: (screen: string) => void;
}

const reviews = [
  {
    name: "김*수",
    date: "2024.01.15",
    rating: 5,
    service: "홀 이펙트 센서 업그레이드",
    content: "스틱 드리프트 때문에 정말 고민이 많았는데, 홀 이펙트 센서로 바꾸고 나서 완전히 새 컨트롤러처럼 되었어요. 작업도 하루만에 끝나서 너무 만족스럽습니다!",
    image: "https://images.unsplash.com/photo-1689593671231-ea788fda8414?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQUzUlMjBEdWFsU2Vuc2UlMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5M3ww&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    name: "이*영",
    date: "2024.01.12",
    rating: 5,
    service: "백버튼 모드 + 헤어 트리거",
    content: "프로게이머 지망생인데 백버튼이랑 헤어 트리거 달고나서 실력이 확실히 올랐어요. 매핑 설정도 친절하게 도와주셨고, 품질이 정말 좋습니다.",
  },
  {
    name: "박*민",
    date: "2024.01.08",
    rating: 5,
    service: "고용량 배터리",
    content: "배터리가 너무 빨리 닳아서 교체했는데, 이제는 하루종일 충전 걱정 없이 게임할 수 있어요. 가격도 합리적이고 작업 시간도 빨라서 좋았습니다.",
  },
  {
    name: "최*호",
    date: "2024.01.05",
    rating: 5,
    service: "커스텀 쉘 교체",
    content: "화이트 쉘로 바꿨는데 너무 예뻐요! 마감도 깔끔하고 조립 상태도 완벽합니다. 친구들이 다 어디서 했냐고 물어봐요 ㅋㅋ",
    image: "https://images.unsplash.com/photo-1592156668899-2cc871c9ac2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb250cm9sbGVyJTIwcmVwYWlyfGVufDF8fHx8MTc2ODkwMzg4Mnww&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    name: "정*아",
    date: "2024.01.02",
    rating: 5,
    service: "클릭키 버튼 모듈",
    content: "버튼 감이 확실히 달라졌어요. 더 정확하고 빠르게 반응해서 게임할 때 스트레스가 확 줄었습니다. 강추합니다!",
  },
  {
    name: "강*우",
    date: "2023.12.28",
    rating: 5,
    service: "홀 이펙트 + 클릭키 + 배터리",
    content: "한번에 여러 작업 맡겼는데 완전 새 컨트롤러 받은 기분이에요. 직원분들도 정말 친절하시고 전문적이십니다. PandaDuck Pix 최고!",
  },
];

export function ReviewsPage({ onNavigate }: ReviewsPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="text-lg tracking-tight" 
            style={{ fontWeight: 600 }}
          >
            PandaDuck Pix
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
        onNavigate={onNavigate}
      />

      {/* Hero */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-8">
        <h1 className="text-4xl mb-4" style={{ fontWeight: 700 }}>
          고객 후기
        </h1>
        <p className="text-lg text-[#86868B]">
          PandaDuck Pix를 경험한 고객님들의<br />
          생생한 후기를 확인해보세요
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-8 mt-8 p-6 bg-[#F5F5F7] rounded-[28px]">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-3xl" style={{ fontWeight: 700 }}>5.0</span>
            </div>
            <p className="text-sm text-[#86868B]">평균 평점</p>
          </div>
          <div>
            <div className="text-3xl mb-1" style={{ fontWeight: 700 }}>1,247</div>
            <p className="text-sm text-[#86868B]">누적 후기</p>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div 
              key={index}
              className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontWeight: 600 }}>{review.name}</span>
                    <span className="text-xs text-[#86868B]">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-[#000000]" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-3 py-2 bg-white rounded-[16px] inline-block">
                <span className="text-sm" style={{ fontWeight: 600 }}>
                  {review.service}
                </span>
              </div>
              
              <p className="text-sm leading-relaxed">
                {review.content}
              </p>
              
              {review.image && (
                <img 
                  src={review.image}
                  alt="Review"
                  className="w-full h-48 object-cover rounded-[20px]"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-12">
        <div className="bg-[#000000] text-white rounded-[28px] p-8 text-center space-y-4">
          <h3 className="text-2xl" style={{ fontWeight: 700 }}>
            당신의 후기를 기다립니다
          </h3>
          <p className="text-[#86868B]">
            PandaDuck Pix와 함께<br />
            최고의 게이밍 경험을 만들어보세요
          </p>
          <button
            onClick={() => onNavigate('service')}
            className="w-full bg-white text-black py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-6"
            style={{ fontWeight: 600 }}
          >
            수리 신청하기
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
