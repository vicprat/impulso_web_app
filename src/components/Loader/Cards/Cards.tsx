import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => (
  <div className="bg-surface-container rounded-xl overflow-hidden shadow-sm">
    <Skeleton className="aspect-square w-full bg-zinc-400" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-full bg-zinc-400" />
      <Skeleton className="h-3 w-2/3 bg-zinc-400" />
      <Skeleton className="h-5 w-1/3 bg-zinc-400" />
    </div>
  </div>
);

export const Cards = ({ count }: { count: number }) => (
       <div className="bg-surface min-h-screen">

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
    {Array.from({ length: count }, (_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
    </div>
);
