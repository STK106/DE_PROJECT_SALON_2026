import { cn } from '@/lib/utils';

function Avatar({ className, src, alt, fallback, ...props }) {
  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      {src ? (
        <img className="aspect-square h-full w-full object-cover" src={src} alt={alt} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium">
          {fallback}
        </div>
      )}
    </div>
  );
}

export { Avatar };
