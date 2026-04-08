import Layout from "@/components/Layout";
import SolarCalculator from "@/components/SolarCalculator";
import SEOHelmet from "@/components/SEOHelmet";

const SolarCalculatorPage = () => {
  return (
    <Layout>
      <SEOHelmet
        title="Solar Calculator - Calculate Your Power Needs | PawaMore Nigeria"
        description="Free solar calculator for Nigeria. Calculate your exact power needs, get AI-powered recommendations for inverters, batteries, and solar panels. Know your costs and ROI before you buy."
        keywords="solar calculator Nigeria, power calculator, solar system calculator, inverter calculator, battery size calculator, solar panel sizing, off-grid calculator, Lagos solar, Abuja solar"
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <SolarCalculator />
        </div>
      </div>
    </Layout>
  );
};

export default SolarCalculatorPage;
