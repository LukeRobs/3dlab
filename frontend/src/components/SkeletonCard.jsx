export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] flex flex-col">
      {/* Image placeholder */}
      <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-[#222] animate-pulse" />

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Title lines */}
        <div className="space-y-1.5">
          <div className="h-3.5 bg-gray-100 dark:bg-[#222] rounded animate-pulse w-full" />
          <div className="h-3.5 bg-gray-100 dark:bg-[#222] rounded animate-pulse w-3/4" />
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="h-5 bg-gray-100 dark:bg-[#222] rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-100 dark:bg-[#222] rounded animate-pulse w-2/3" />
        </div>

        {/* Button */}
        <div className="h-10 bg-gray-100 dark:bg-[#222] rounded-lg animate-pulse w-full mt-1" />
      </div>
    </div>
  );
}
