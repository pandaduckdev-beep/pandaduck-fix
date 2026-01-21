import { useState } from "react";
import { HomeScreen } from "@/app/components/HomeScreen";
import { ServiceSelection } from "@/app/components/ServiceSelection";
import { RepairForm } from "@/app/components/RepairForm";
import { ServicesPage } from "@/app/components/ServicesPage";
import { ReviewsPage } from "@/app/components/ReviewsPage";
import { AboutPage } from "@/app/components/AboutPage";

type Screen = "home" | "service" | "form" | "services" | "reviews" | "about";

export interface SelectedService {
  id: string;
  name: string;
  price: number;
  selectedOption?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface ServiceSelectionData {
  services: SelectedService[];
  subtotal: number;
  discount: number;
  total: number;
  discountName?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [selectionData, setSelectionData] = useState<ServiceSelectionData | null>(null);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
    // Scroll to top when navigating
    window.scrollTo(0, 0);
  };

  const handleServiceSelection = (data: ServiceSelectionData) => {
    setSelectionData(data);
    setCurrentScreen("form");
    window.scrollTo(0, 0);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {currentScreen === "home" && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === "service" && (
        <ServiceSelection
          onNavigate={handleNavigate}
          onConfirm={handleServiceSelection}
        />
      )}
      {currentScreen === "form" && (
        <RepairForm
          onNavigate={handleNavigate}
          selectionData={selectionData}
        />
      )}
      {currentScreen === "services" && <ServicesPage onNavigate={handleNavigate} />}
      {currentScreen === "reviews" && <ReviewsPage onNavigate={handleNavigate} />}
      {currentScreen === "about" && <AboutPage onNavigate={handleNavigate} />}
    </div>
  );
}
