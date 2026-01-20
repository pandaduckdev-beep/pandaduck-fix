import { useState } from "react";
import { HomeScreen } from "@/app/components/HomeScreen";
import { ServiceSelection } from "@/app/components/ServiceSelection";
import { RepairForm } from "@/app/components/RepairForm";
import { ServicesPage } from "@/app/components/ServicesPage";
import { ReviewsPage } from "@/app/components/ReviewsPage";
import { AboutPage } from "@/app/components/AboutPage";

type Screen = "home" | "service" | "form" | "services" | "reviews" | "about";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
    // Scroll to top when navigating
    window.scrollTo(0, 0);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {currentScreen === "home" && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === "service" && <ServiceSelection onNavigate={handleNavigate} />}
      {currentScreen === "form" && <RepairForm onNavigate={handleNavigate} />}
      {currentScreen === "services" && <ServicesPage onNavigate={handleNavigate} />}
      {currentScreen === "reviews" && <ReviewsPage onNavigate={handleNavigate} />}
      {currentScreen === "about" && <AboutPage onNavigate={handleNavigate} />}
    </div>
  );
}
