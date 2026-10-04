import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import OrderForm from "@/components/OrderForm";
import ChatBot from "@/components/ChatBot";
import Footer from "@/components/Footer";
import Founder from "@/components/Founder";
import WhatsAppButton from "@/components/WhatsAppButton";
import HowItWorks from "@/components/HowItWorks";
import CustomProject from "@/components/CustomProject";
import { ServicePlan } from "@/components/ServiceCard";
const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Services onBuy={setSelectedPlan} />
      <HowItWorks />
      <Portfolio />
      <Testimonials />
      <Founder />
      <CustomProject />
      <Footer />
      <ChatBot />
      <WhatsAppButton />
      <OrderForm plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </div>
  );
};

export default Index;
