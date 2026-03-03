import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">Terms &amp; Conditions</h1>
        <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p className="text-foreground font-medium">Last updated: March 3, 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing and using ReadzRaw's website and services at readzraw.lovable.app, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Services</h2>
            <p>ReadzRaw provides professional web development services including but not limited to landing pages, business websites, e-commerce websites, and custom web applications. Service details, pricing, and deliverables are outlined in individual project agreements.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Orders &amp; Payments</h2>
            <p>All orders require an advance payment as specified during checkout. The advance amount is non-refundable once work has commenced. Full payment is due upon project completion and before final delivery of source files and deployment.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Client Responsibilities</h2>
            <p>Clients must provide accurate project requirements, necessary content (text, images, branding assets), and timely feedback. Delays caused by late client input may extend delivery timelines.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Intellectual Property</h2>
            <p>Upon full payment, all custom-developed code, designs, and assets created specifically for the client's project are transferred to the client. ReadzRaw retains the right to showcase completed projects in its portfolio unless otherwise agreed in writing.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Revisions</h2>
            <p>Each service plan includes a specified number of revision rounds. Additional revisions beyond the included amount may incur extra charges as communicated in advance.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Limitation of Liability</h2>
            <p>ReadzRaw shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid by the client for the specific project in question.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Termination</h2>
            <p>Either party may terminate a project agreement with written notice. In case of termination, the client is responsible for payment of work completed up to the termination date. Advance payments are non-refundable.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">9. Governing Law</h2>
            <p>These terms are governed by and construed in accordance with the laws of Pakistan. Any disputes shall be resolved through good-faith negotiation before pursuing formal legal action.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
            <p>For questions about these Terms &amp; Conditions, contact us at <a href="mailto:readzraw@gmail.com" className="text-primary hover:underline">readzraw@gmail.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
