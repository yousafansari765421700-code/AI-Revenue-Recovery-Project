"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Revenue Recovery
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
              Recover Revenue You Didn&apos;t Know You Were Losing.
            </h1>
            <p className="text-lg text-muted mb-8 max-w-xl mx-auto lg:mx-0">
              AI Revenue Recovery helps businesses detect failed payments, identify revenue leakage, and automatically recover lost revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/signup">
                <Button size="lg">Start Recovering Revenue</Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg">View Demo</Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-dark">Trusted by 2,500+ businesses</p>
                <p className="text-xs text-muted">Recovering revenue worldwide</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-float">
              <div className="glass-card rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-dark">Revenue Dashboard</h3>
                    <p className="text-sm text-muted">Real-time Recovery Insights</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
                    <span className="text-sm text-muted">Live</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dark">$124,500 Recovered</p>
                      <p className="text-sm text-muted">This month</p>
                    </div>
                    <span className="text-success font-semibold">+23%</span>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dark">342 Invoices</p>
                      <p className="text-sm text-muted">Processed today</p>
                    </div>
                    <span className="text-primary font-semibold">Active</span>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dark">Recovery Rate</p>
                      <p className="text-sm text-muted">Last 30 days</p>
                    </div>
                    <span className="text-accent font-semibold">94.2%</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">Total Revenue at Risk</p>
                      <p className="text-2xl font-bold text-dark">$48,320</p>
                    </div>
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 rounded-full gradient-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
