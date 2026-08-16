import { FeatureSections } from "@/components/marketing/feature-sections";
import { Hero } from "@/components/marketing/hero";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeatureSections />
      </main>
      <SiteFooter />
    </div>
  );
}
