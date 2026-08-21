import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function CTASection() {
  return (
    <section id="demo" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-16 text-center">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Stop Losing Revenue Silently.
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using AI Revenue Recovery to recoup lost revenue and optimize their financial operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Start Recovering Today
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
