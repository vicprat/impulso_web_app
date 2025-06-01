import { Suspense } from "react";
import { Content } from "./components";
import { Skeleton } from "@/components/ui/skeleton";

export const Search = () => {
  return (
    <Suspense fallback={
      <div className="relative w-full max-w-md">
        <Skeleton className="h-14 w-full rounded-full bg-surface-container-high" />
      </div>
    }>
      <Content />
    </Suspense>
  );
}
