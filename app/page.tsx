import { getAllTablets, getStats } from "@/lib/tablets";
import { HomeClient } from "@/components/HomeClient";

export default function HomePage() {
  const tablets = getAllTablets();
  const stats = getStats();

  return <HomeClient tablets={tablets} stats={stats} />;
}
