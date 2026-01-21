import { useState } from "react";
import { HomeScreen } from "@/app/components/HomeScreen";
import { ControllerSelection } from "@/app/components/ControllerSelection";
import { ServiceSelection } from "@/app/components/ServiceSelection";
import { RepairForm } from "@/app/components/RepairForm";
import { ServicesPage } from "@/app/components/ServicesPage";
import { ReviewsPage } from "@/app/components/ReviewsPage";
import { AboutPage } from "@/app/components/AboutPage";

type Screen = "home" | "controller" | "service" | "form" | "services" | "reviews" | "about";

export interface SelectedService {
  id: string; // service_id (TEXT)
  uuid: string; // services.id (UUID)
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
  const [controllerModel, setControllerModel] = useState<string | null>(null);
  const [selectionData, setSelectionData] = useState<ServiceSelectionData | null>(null);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
    // Scroll to top when navigating
    window.scrollTo(0, 0);
  };

  const handleControllerSelection = (model: string) => {
    setControllerModel(model);
    setCurrentScreen("service");
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
      {currentScreen === "controller" && (
        <ControllerSelection
          onNavigate={handleNavigate}
          onSelect={handleControllerSelection}
        />
      )}
      {currentScreen === "service" && (
        <ServiceSelection
          onNavigate={handleNavigate}
          onConfirm={handleServiceSelection}
          controllerModel={controllerModel}
        />
      )}
      {currentScreen === "form" && (
        <RepairForm
          onNavigate={handleNavigate}
          selectionData={selectionData}
          controllerModel={controllerModel}
        />
      )}
      {currentScreen === "services" && <ServicesPage onNavigate={handleNavigate} />}
      {currentScreen === "reviews" && <ReviewsPage onNavigate={handleNavigate} />}
      {currentScreen === "about" && <AboutPage onNavigate={handleNavigate} />}
    </div>
  );
}
