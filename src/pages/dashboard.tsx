import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 md:py-6">
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  );
}
