const stats = [
  { value: "$2.4M+", label: "Revenue Recovered" },
  { value: "18K+", label: "Failed Payments Detected" },
  { value: "94%", label: "Recovery Automation" },
  { value: "3.2x", label: "Average ROI" },
];

export default function StatsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
            Real Results, <span className="gradient-text">Real Revenue</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            These are product marketing examples and not verified real-world statistics. Actual results may vary.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </p>
              <p className="text-muted font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
