export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]">
      <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-[#2a2a2a] animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse w-1/2" />
        <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse w-full mt-2" />
      </div>
    </div>
  );
}
