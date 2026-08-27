import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { PracticeAreas } from "@/components/PracticeAreas";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ScheduleConsult } from "@/components/ScheduleConsult";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function LandingPage() {
  return (
    <main className="bg-cream">
      <ScrollReveal />
      <Hero />
      <IntroSection />
      <PracticeAreas />

      <section className="px-6 pb-8 sm:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          <WhyChooseUs />
          <ScheduleConsult />
        </div>
      </section>

      <Footer />
    </main>
  );
}
