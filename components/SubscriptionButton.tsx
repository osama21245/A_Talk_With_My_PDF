"use client";
import React from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { Sparkles } from "lucide-react";

interface SubscriptionButtonProps {
  isPro: boolean;
  className?: string;
}

const SubscriptionButton = ({ isPro, className }: SubscriptionButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button 
      disabled={loading}
      className={`${className} ${!isPro ? "bg-gradient-to-r from-[#00FF9D] to-[#39FF14] hover:opacity-90 text-black px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#00FF9D]/20" : ""}`}
      onClick={handleSubscription}
    >
      {isPro ? "Manage Subscription" : "Get Pro"}
      {!isPro && <Sparkles className="ml-3 w-5 h-5" />}
    </Button>
  );
};

export default SubscriptionButton;