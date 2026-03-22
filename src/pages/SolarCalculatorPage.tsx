import Layout from "@/components/Layout";
import SolarCalculator from "@/components/SolarCalculator";
import SEOHelmet from "@/components/SEOHelmet";

const SolarCalculatorPage = () => {
  return (
    <Layout>
      <SEOHelmet
        title="Solar Calculator - Calculate Your Power Needs | PawaMore"
        description="Use our free solar calculator to estimate your power needs and get instant recommendations for inverters, batteries, and solar panels. Plan your solar system today!"
        keywords="solar calculator, power calculator, solar system calculator, inverter calculator, battery size calculator, Nigeria solar calculator"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Solar Power Calculator</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your exact power needs and get personalized recommendations for your solar system.
            Know exactly what to buy for your home or business.
          </p>
        </div>
        <SolarCalculator />
      </div>
    </Layout>
  );
};

export default SolarCalculatorPage;
