import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Instagram,
  Linkedin,
  HeartHandshake,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const ProfileCustomerCareTab: React.FC = () => {
  const contactInfo = {
    phone: {
      number: "+91 88006-33755",
      hours: "Mon-Sat: 9:00 AM - 8:00 PM",
    },
    email: {
      address: "silaigo.offical@gmail.com",
      response: "We'll respond within 24 hours",
    },
    whatsapp: {
      number: "918800633755",
      message: "Hello! I need assistance with...",
    },
    social: {
      instagram: "https://www.instagram.com/silai_go/",
      linkedin: "https://www.linkedin.com/company/silaigo",
    },
  };

  const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.number}?text=${encodeURIComponent(contactInfo.whatsapp.message)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Customer Care</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Phone Card */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-lg mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">{contactInfo.phone.hours}</p>
            <a
              href={`tel:${contactInfo.phone.number}`}
              className="text-primary hover:underline"
            >
              {contactInfo.phone.number}
            </a>
          </CardContent>
        </Card>

        {/* Email Card */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-lg mb-2">Email Us</h3>
            <p className="text-gray-600 mb-4">{contactInfo.email.response}</p>
            <a
              href={`mailto:${contactInfo.email.address}`}
              className="text-primary hover:underline"
            >
              {contactInfo.email.address}
            </a>
          </CardContent>
        </Card>

        {/* WhatsApp Card */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <FaWhatsapp className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-medium text-lg mb-2">Chat on WhatsApp</h3>
            <p className="text-gray-600 mb-4">Get instant support</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
            >
              <FaWhatsapp className="h-5 w-5" />
              Start Chat
            </a>
          </CardContent>
        </Card>

        {/* Social Media Card */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <HeartHandshake className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-lg mb-2">Follow Us</h3>
            <p className="text-gray-600 mb-4">Connect with us on social media</p>
            <div className="flex space-x-4">
              <a
                href={contactInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href={contactInfo.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Business Hours</h4>
                <p className="text-sm text-gray-600">
                  Monday-Saturday: 10AM-7PM
                </p>
                <p className="text-sm text-gray-600">Sunday: Closed</p>
              </div>
            </div>
            <div className="flex items-start">
              <MessageSquare className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Customer Support</h4>
                <p className="text-sm text-gray-600">
                  Available 24/7 for your assistance
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCustomerCareTab; 