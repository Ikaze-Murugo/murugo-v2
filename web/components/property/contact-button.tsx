"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail, Send } from "lucide-react";
import { Property } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

interface ContactButtonProps {
  property: Property;
  landlord: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export function ContactButton({ property, landlord }: ContactButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleInAppMessage = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/messages`);
      return;
    }
    // Navigate to messages page with pre-selected conversation
    router.push(`/messages?userId=${property.listerId}`);
  };

  const handleWhatsAppContact = () => {
    if (!landlord.phone) {
      alert("Phone number not available");
      return;
    }

    // Format phone number for WhatsApp (remove spaces, dashes, etc.)
    const phoneNumber = landlord.phone.replace(/[^\d+]/g, "");
    
    // Create WhatsApp message
    const message = encodeURIComponent(
      `Hi, I'm interested in your property: ${property.title}\n` +
      `Location: ${property.location.sector}, ${property.location.district}\n` +
      `Price: ${property.currency} ${property.price.toLocaleString()}\n` +
      `Property ID: ${property.id}`
    );

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePhoneCall = () => {
    if (!landlord.phone) {
      alert("Phone number not available");
      return;
    }
    window.location.href = `tel:${landlord.phone}`;
  };

  const handleEmailContact = () => {
    if (!landlord.email) {
      alert("Email not available");
      return;
    }

    const subject = encodeURIComponent(`Inquiry about: ${property.title}`);
    const body = encodeURIComponent(
      `Hi ${landlord.name},\n\n` +
      `I'm interested in your property:\n` +
      `Title: ${property.title}\n` +
      `Location: ${property.location.sector}, ${property.location.district}\n` +
      `Price: ${property.currency} ${property.price.toLocaleString()}\n` +
      `Property ID: ${property.id}\n\n` +
      `Please provide more information.\n\n` +
      `Thank you!`
    );

    window.location.href = `mailto:${landlord.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-3">
      {/* In-App Message Button (Primary) */}
      <Button
        onClick={handleInAppMessage}
        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg transition-all"
        size="lg"
      >
        <Send className="h-5 w-5 mr-2" />
        Send Message
      </Button>

      {/* WhatsApp Button (Secondary) */}
      {landlord.phone && (
        <Button
          onClick={handleWhatsAppContact}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Contact via WhatsApp
        </Button>
      )}

      {/* Secondary Contact Options */}
      <div className="grid grid-cols-2 gap-3">
        {landlord.phone && (
          <Button
            onClick={handlePhoneCall}
            variant="outline"
            size="lg"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call
          </Button>
        )}

        {landlord.email && (
          <Button
            onClick={handleEmailContact}
            variant="outline"
            size="lg"
          >
            <Mail className="h-5 w-5 mr-2" />
            Email
          </Button>
        )}
      </div>

      {/* Landlord Info */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Property Owner</p>
        <p className="font-semibold">{landlord.name}</p>
        {landlord.phone && (
          <p className="text-sm text-muted-foreground mt-1">{landlord.phone}</p>
        )}
      </div>
    </div>
  );
}
