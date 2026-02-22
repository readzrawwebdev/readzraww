import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="border-t border-border bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-heading text-2xl font-bold text-gradient mb-4">ReadzRaw</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional web development agency delivering pixel-perfect websites at affordable prices. Your vision, our expertise.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-foreground transition-colors">Services & Pricing</a></li>
              <li><a href="#portfolio" className="hover:text-foreground transition-colors">Our Portfolio</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Get in Touch</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <a href="mailto:readzraw@gmail.com" className="flex items-center gap-3 hover:text-foreground transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Mail size={14} className="text-primary" />
                </div>
                readzraw@gmail.com
              </a>
              <a href="tel:03341275358" className="flex items-center gap-3 hover:text-foreground transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Phone size={14} className="text-primary" />
                </div>
                0334 1275358
              </a>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin size={14} className="text-primary" />
                </div>
                <span>Pakistan</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ReadzRaw. All rights reserved.</p>
          <p>Built with ❤️ by ReadzRaw</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
