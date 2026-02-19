import { Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="border-t border-border bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-heading text-2xl font-bold text-gradient mb-3">ReadzRaw</h3>
            <p className="text-sm text-muted-foreground">
              Professional web development agency delivering pixel-perfect websites at affordable prices.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-foreground transition-colors">Services</a></li>
              <li><a href="#portfolio" className="hover:text-foreground transition-colors">Portfolio</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <a href="mailto:readzraw@gmail.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail size={16} className="text-primary" /> readzraw@gmail.com
              </a>
              <a href="tel:03341275358" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone size={16} className="text-primary" /> 0334 1275358
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ReadzRaw. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
