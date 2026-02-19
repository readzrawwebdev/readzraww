import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import OrderForm from "@/components/OrderForm";
import ChatBot from "@/components/ChatBot";
import Footer from "@/components/Footer";
import { ServicePlan } from "@/components/ServiceCard";

const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Services onBuy={setSelectedPlan} />
      <Portfolio />
      <Footer />
      <ChatBot />
      <OrderForm plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </div>
  );
};

export default Index;
