import { Hero } from "@/components/home/hero";
import { BestSellers } from "@/components/home/best-sellers";
import { PeptideScience } from "@/components/home/peptide-science";
import { ShopByConcern } from "@/components/home/shop-by-concern";
import { IngredientSpotlight } from "@/components/home/ingredient-spotlight";
import { ReviewsSection } from "@/components/home/reviews-section";
import { RoutineBuilder } from "@/components/home/routine-builder";
import { Newsletter } from "@/components/home/newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <BestSellers />
      <PeptideScience />
      <ShopByConcern />
      <IngredientSpotlight />
      <ReviewsSection />
      <RoutineBuilder />
      <Newsletter />
    </>
  );
}
