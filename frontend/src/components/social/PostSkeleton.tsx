const PostSkeleton = () => (
  <div className="border-b border-border animate-pulse">
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-9 w-9 rounded-full bg-secondary" />
      <div className="space-y-1">
        <div className="h-3 w-24 rounded bg-secondary" />
        <div className="h-2 w-12 rounded bg-secondary" />
      </div>
    </div>
    <div className="aspect-square w-full bg-secondary" />
    <div className="p-4 space-y-2">
      <div className="h-3 w-16 rounded bg-secondary" />
      <div className="h-3 w-3/4 rounded bg-secondary" />
    </div>
  </div>
);

export default PostSkeleton;
