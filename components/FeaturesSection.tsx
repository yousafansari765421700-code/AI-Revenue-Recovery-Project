"use client";

import {
  CreditCard,
  Search,
  BarChart3,
  Zap,
  PieChart,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Failed Payment Recovery",
    description: "Automatically retry failed transactions and recover lost revenue from declined payments.",
    color: "primary",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Revenue Leakage Detection",
    description: "Identify hidden revenue gaps across your payment stack with AI-powered pattern recognition.",
    color: "secondary",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "AI-Powered Insights",
    description: "Get actionable intelligence on payment failures, customer behavior, and recovery opportunities.",
    color: "accent",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Automated Recovery",
    description: "Smart workflows that automatically recover revenue without manual intervention.",
    color: "success",
  },
  {
    icon: <PieChart className="w-6 h-6" />,
    title: "Customer Payment Analytics",
    description: "Deep analytics into payment patterns, churn signals, and customer lifetime value.",
    color: "warning",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Revenue Forecasting",
    description: "Predict future revenue trends and potential losses with advanced machine learning models.",
    color: "danger",
  },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary-light text-secondary",
  accent: "bg-accent-light text-accent",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
            Powerful Features for <span className="gradient-text">Revenue Recovery</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Everything you need to detect, analyze, and recover lost revenue automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-background hover:bg-white border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${colorMap[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-dark mb-2">{feature.title}</h3>
              <p className="text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
