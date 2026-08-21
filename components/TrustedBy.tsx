const companies = [
  "Stripe", "Shopify", "PayPal", "Square", "Adyen", "Braintree",
];

export default function TrustedBy() {
  return (
    <section className="py-12 border-y border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted uppercase tracking-wider mb-8">
          Trusted by innovative companies worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((company) => (
            <div
              key={company}
              className="text-xl font-bold text-gray-300 hover:text-gray-500 transition-colors duration-200"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
