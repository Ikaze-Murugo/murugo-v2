"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
          Contact us
        </h1>
        <p className="text-muted-foreground mb-10">
          Have a question or feedback? Send us a message and we&apos;ll get back to you.
        </p>

        {submitted ? (
          <div className="p-6 rounded-xl border bg-primary/5 border-primary/20 text-center">
            <p className="font-medium text-primary">Thank you for your message.</p>
            <p className="text-sm text-muted-foreground mt-1">
              We&apos;ll respond as soon as we can.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Your message..."
                  className="w-full px-4 py-3 pl-10 rounded-md border bg-background resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="gap-2 bg-[#949DDB] hover:bg-[#949DDB]/90">
              <Send className="h-4 w-4" />
              Send message
            </Button>
          </form>
        )}

        <div className="mt-12 p-6 rounded-xl border bg-muted/30">
          <p className="text-sm font-medium mb-2">General inquiries</p>
          <p className="text-sm text-muted-foreground">
            For support or partnership, use the form above or reach out via the email
            provided in the app footer once available.
          </p>
        </div>
      </div>
    </div>
  );
}
