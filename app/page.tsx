import { getAllTablets, getDynasties, getStats } from "@/lib/tablets";
import { HomeClient } from "@/components/HomeClient";

export default function HomePage() {
  const tablets = getAllTablets();
  const dynasties = getDynasties();
  const stats = getStats();

  return (
    <HomeClient
      tablets={tablets}
      dynasties={dynasties}
      stats={{ total: stats.total, withImage: stats.withImage, withReview: stats.withReview }}
    />
  );
}
