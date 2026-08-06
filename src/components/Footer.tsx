import React from "react";
import Link from "next/link";
import {
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Facebook,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-charcoal text-white w-full">
      {/* 📱 Compact Mobile Footer */}
      <div className="block sm:hidden px-4 py-3 text-xs">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">SilaiGo</span>
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/profile.php?id=61576729839174"
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-primary"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://www.instagram.com/silai_go/"
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-primary"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/silaigo"
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-primary"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div className="flex justify-between text-white/60 mt-1">
            <div className="flex items-center space-x-1">
              <Phone size={12} />
              <span>Helpdesk</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail size={12} />
              <span className="truncate">support@silai.go</span>
            </div>
          </div>

          <div className="flex justify-between text-white/50 text-[11px] mt-1">
            <span>© {currentYear} SilaiGo</span>
            <div className="flex space-x-2">
              <Link href={"/return-refund-policy"} className="hover:text-white">
                Return and Refund Policy
              </Link>
              <Link href={"/privacy-policy"} className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href={"/terms-and-conditions"} className="hover:text-white">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 💻 Full Desktop Footer */}
      <div className="hidden sm:block max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-sm">
          {/* Brand */}
          <div>
            <h2 className="font-playfair text-xl mb-3">SilaiGo</h2>
            <p className="text-white/70 text-sm mb-4">
              India’s smartest tailoring platform—where tradition meets tech.
              Personalized fits, doorstep service, and AI-powered craftsmanship.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61576729839174"
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-primary"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/silai_go/"
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-primary"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/silaigo"
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-primary"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base mb-3">Quick Links</h3>
            <ul className="space-y-2 text-white/70">
              <li>
                <a href="#" className="hover:text-primary">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Book a Pickup
                </a>
              </li>
              <li>
                <a href="/tailoring" className="hover:text-primary">
                  Our Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-base mb-3">Contact Us</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="text-primary mt-[2px]" />
                <span>
                  Shop No. 5, Lane 7, Shiva Towers, Sector 66
                  <br />
                  Noida, India
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-primary" />
                <span>Customer Care: +91 88006-33755</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-primary" />
                <span>silaigo.offical@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-base mb-3">Stay in the Loop</h3>
            <p className="text-white/60 text-sm mb-3">
              Be the first to know about exclusive offers, seasonal styles, and
              tailoring tips.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder:text-white/50"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-light text-white py-2 text-sm rounded"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Legal Footer Bar */}
        <div className="mt-10 border-t border-white/10 pt-5 flex flex-col md:flex-row justify-between items-center text-xs text-white/50">
          <p>© {currentYear} SilaiGo. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link href={"/return-refund-policy"} className="hover:text-white">
              Return and Refund Policy
            </Link>
            <Link href={"/privacy-policy"} className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href={"/terms-and-conditions"} className="hover:text-white">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
