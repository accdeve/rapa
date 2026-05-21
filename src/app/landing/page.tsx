'use client';

import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import ROICalculator from '@/components/landing/ROICalculator';
import PricingPreview from '@/components/landing/PricingPreview';
import WaitlistForm from '@/components/landing/WaitlistForm';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="landing-page">
      <div className="grid-background" />
      <HeroSection />
      <HowItWorks />
      <ROICalculator />
      <PricingPreview />
      <WaitlistForm />
      <Footer />

      <style jsx>{`
        .landing-page {
          position: relative;
          min-height: 100vh;
          background: #F8FAFC;
        }

        .grid-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: 24px 24px;
          background-image: 
            linear-gradient(to right, rgba(140, 113, 103, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(140, 113, 103, 0.05) 1px, transparent 1px);
          z-index: 0;
          pointer-events: none;
        }
      `}</style>
    </main>
  );
}