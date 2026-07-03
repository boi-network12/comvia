// components/LandingPage/TrustedBy.tsx
"use client";

export default function TrustedBy() {
  const companies = [
    { name: "TechFlow", gradient: "from-blue-500 to-cyan-500" },
    { name: "CloudSync", gradient: "from-purple-500 to-pink-500" },
    { name: "DataHub", gradient: "from-emerald-500 to-teal-500" },
    { name: "GrowthStack", gradient: "from-orange-500 to-red-500" },
    { name: "SecureNet", gradient: "from-indigo-500 to-blue-500" },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-8">
          Trusted by leading companies worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
          {companies.map((company, index) => (
            <div
              key={index}
              className={`text-2xl font-bold bg-gradient-to-r ${company.gradient} bg-clip-text text-transparent opacity-60 hover:opacity-100 transition-all hover:scale-105 cursor-default`}
            >
              {company.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}