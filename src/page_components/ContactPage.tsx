"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AtSign,
  Building,
  Clock,
  Facebook,
  HeartHandshake,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Users,
  X,
} from "lucide-react";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the data to your backend

    toast({
      title: "Message sent!",
      description: "We'll get back to you soon.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MetaTagsProvider
        title="Contact Us | SilaiGo"
        description="Get in touch with SilaiGo for any queries or support. We are here to help you."
        canonicalPath="/contact"
        keywords="Contact, Inquiry, Support, Customer Service, SilaiGo, Tailoring Services, Tailoring, Tailor, Tailoring Shop, Tailoring Service, Tailoring Business, Tailoring Store, Tailoring Website, Tailoring Online, Tailoring Online Store, Tailoring Online Business, Tailoring Online Shop"
      />
      {/* Page Content */}
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-gray-600 mb-8">
            We'd love to hear from you. Whether you have a question about our
            services, custom designs, or anything else, our team is ready to
            assist you.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="hover-card">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">Mon-Sat: 9:00 AM - 8:00 PM</p>
                <a
                  href="tel:+918800633755"
                  className="text-primary hover:underline"
                >
                  +91 88006-33755
                </a>
              </CardContent>
            </Card>

            <Card className="hover-card">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Email Us</h3>
                <p className="text-gray-600 mb-4">
                  We'll respond within 24 hours
                </p>
                <a
                  href="mailto:info@silaigo.com"
                  className="text-primary hover:underline"
                >
                  silaigo.offical@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="hover-card">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Visit Us</h3>
                <p className="text-gray-600 mb-4">
                  Mon-Sat: 10:00 AM - 7:00 PM
                </p>
                <address className="not-italic text-sm text-gray-600">
                  Shop No. 5, Lane 7, Shiva Towers, Sector 66
                  <br />
                  Noida, India
                </address>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8 text-sm sm:text-base md:text-lg">
                Have a specific request or inquiry? Fill out the form below and
                our team will get back to you promptly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6">
                Find Us
              </h2>
              <p className="text-gray-600 mb-8 text-sm sm:text-base md:text-lg">
                Visit our store for a personalized consultation and to explore
                our fabric collection.
              </p>

              <div className="bg-white rounded-xl overflow-hidden shadow-sm border h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14020.67112870907!2d77.3604991!3d28.6010435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce562c2e7a38b%3A0x8e4c4e4b7449b90!2sSector%2066%2C%20Noida%2C%20Uttar%20Pradesh%20201301!5e0!3m2!1sen!2sin!4v1686501902389!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Business Hours</h4>
                    <p className="text-sm text-gray-600">
                      Monday-Saturday: 10AM-7PM
                    </p>
                    <p className="text-sm text-gray-600">Sunday: Closed</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <HeartHandshake className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Follow Us</h4>
                    <div className="flex space-x-3 mt-2">
                      <a
                        href="https://www.instagram.com/silai_go/"
                        className="text-gray-600 hover:text-primary transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a
                        href="https://www.linkedin.com/company/silaigo"
                        className="text-gray-600 hover:text-primary transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6 text-center">
            About Us
          </h2>

          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-gray-600 mb-6 text-sm sm:text-base md:text-lg">
              Founded in 2024, Silai Go has been at the forefront of combining
              traditional tailoring expertise with modern fashion trends. Our
              mission is to provide perfectly tailored clothing that celebrates
              both heritage and contemporary style.
            </p>
            <p className="text-gray-600 mb-6 text-sm sm:text-base md:text-lg">
              With a team of experienced designers and master tailors, we take
              pride in crafting garments that not only look exceptional but also
              feel comfortable and last for years. Our commitment to quality and
              customer satisfaction has made us a trusted name in the industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center space-y-4 hover-card flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium">5+ Years</h3>
              <p className="text-sm text-gray-600">Of tailoring excellence</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm text-center space-y-4 hover-card flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium">50+ Team Members</h3>
              <p className="text-sm text-gray-600">
                Skilled artisans & designers
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm text-center space-y-4 hover-card flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <AtSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium">10,000+ Customers</h3>
              <p className="text-sm text-gray-600">Across India and globally</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm text-center space-y-4 hover-card flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium">24/7 Support</h3>
              <p className="text-sm text-gray-600">Always here to help you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      {/* <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif font-medium mb-10 text-center">
              Meet Our Team
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover-card">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-medium text-lg mb-1">{member.name}</h3>
                    <p className="text-primary text-sm mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}
    </div>
  );
};

export default ContactPage;
