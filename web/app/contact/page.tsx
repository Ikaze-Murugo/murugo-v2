"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, Send, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-neutral-900">
            Get in Touch
          </h1>
          <p className="text-neutral-600 text-sm md:text-base max-w-2xl mx-auto">
            Have a question or feedback? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Message Sent!</h3>
                  <p className="text-neutral-600 text-sm">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="mt-6"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="How can we help?"
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                      Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-4 h-4 w-4 text-neutral-400" />
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        placeholder="Tell us more about your inquiry..."
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-neutral-300 bg-white resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 h-11"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-3">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">Email Us</h3>
              <p className="text-xs text-neutral-600 mb-2">
                For general inquiries
              </p>
              <a href="mailto:info@murugohomes.com" className="text-sm text-primary hover:underline">
                info@murugohomes.com
              </a>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-3">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">Call Us</h3>
              <p className="text-xs text-neutral-600 mb-2">
                Mon-Fri, 9am-6pm EAT
              </p>
              <a href="tel:+250788000000" className="text-sm text-primary hover:underline">
                +250 788 000 000
              </a>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">Visit Us</h3>
              <p className="text-xs text-neutral-600">
                Kigali, Rwanda<br />
                KG 123 St, Kimihurura
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl border border-neutral-200 p-6 text-center">
          <h3 className="font-semibold text-neutral-900 mb-2 text-sm">Looking for Support?</h3>
          <p className="text-xs text-neutral-600 max-w-xl mx-auto">
            If you&apos;re experiencing technical issues or need help with your account, please visit our Help Center for quick answers and troubleshooting guides.
          </p>
        </div>
      </div>
    </div>
  );
}
