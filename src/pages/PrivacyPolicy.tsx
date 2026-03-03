import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p className="text-foreground font-medium">Last updated: March 3, 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide directly when placing orders, including your name, email address, phone number, business name, and project details. We also collect payment receipts you upload for order verification.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>Your information is used to process and fulfill your orders, communicate project updates, provide customer support, and improve our services. We may also use your email to send service-related notifications.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Authentication</h2>
            <p>We use Google Sign-In for user authentication. When you sign in, we receive your Google profile information (name and email) to create and manage your account. We do not store your Google password.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Data Storage &amp; Security</h2>
            <p>Your data is stored securely using industry-standard encryption and access controls. Uploaded files (such as payment receipts) are stored in secure cloud storage with access restricted to you and our admin team.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers who assist in operating our platform, subject to confidentiality agreements.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Cookies &amp; Analytics</h2>
            <p>Our website may use cookies and similar technologies to enhance your browsing experience and gather usage analytics. You can control cookie settings through your browser preferences.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may request a copy of your data or ask for its deletion by contacting us. We will respond to such requests within a reasonable timeframe.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Children's Privacy</h2>
            <p>Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware of such data, we will delete it promptly.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:readzraw@gmail.com" className="text-primary hover:underline">readzraw@gmail.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
