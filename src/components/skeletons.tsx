import { Skeleton } from "./ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[150px] lg:w-[250px]" />
        <Skeleton className="h-8 w-[36px]" />
      </div>
      <div>
        <Skeleton className="h-[40px] w-full" />

        {[...Array(10)].map((_, index) => (
          <Skeleton
            key={index}
            className="h-[49px] w-full border-y border-background"
          />
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-[36px] w-[494.52px]" />
      </div>
    </div>
  );
}

export function LoadingDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[150px] lg:w-[250px]" />
        <Skeleton className="h-8 w-[36px]" />
      </div>
      <div>
        <Skeleton className="h-[250px]"/>
      </div>
      <div>
        <Skeleton className="h-[40px] w-full" />

        {[...Array(10)].map((_, index) => (
          <Skeleton
            key={index}
            className="h-[36.5px] w-full border-y border-background"
          />
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-[36px] w-[494.52px]" />
      </div>
    </div>
  );
}
