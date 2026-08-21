"use client";

import { Link2, Brain, Workflow, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect your payment data",
    description: "Securely integrate your payment processors, invoicing tools, and customer databases in minutes.",
    icon: <Link2 className="w-8 h-8" />,
  },
  {
    number: "02",
    title: "AI detects revenue opportunities",
    description: "Our machine learning models analyze payment failures and identify revenue leakage patterns.",
    icon: <Brain className="w-8 h-8" />,
  },
  {
    number: "03",
    title: "Recovery workflows run automatically",
    description: "Smart recovery sequences execute automatically across multiple customer touchpoints.",
    icon: <Workflow className="w-8 h-8" />,
  },
  {
    number: "04",
    title: "Track recovered revenue",
    description: "Monitor your recovery performance in real-time with detailed analytics and reporting.",
    icon: <BarChart3 className="w-8 h-8" />,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Get started in minutes and start recovering lost revenue with our simple four-step process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent -translate-y-1/2" />

          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="glass-card rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary text-white mb-6 shadow-lg shadow-primary/25">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark text-white text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-dark mb-3">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
