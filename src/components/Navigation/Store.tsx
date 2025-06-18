import { Suspense } from "react";
import { Content } from "./components";

type Props =  {
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
}


export const Store:  React.FC<Props> = ({onOpenFilters, activeFiltersCount}) => {
  return (
    <Suspense fallback={
      <nav className="bg-white border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between py-4">
          <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        </div>
      </nav>
    }>
      <Content onOpenFilters={onOpenFilters} activeFiltersCount={activeFiltersCount} />
    </Suspense>
  );
}