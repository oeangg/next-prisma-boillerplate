import * as React from "react";

import { Eye, EyeClosed, LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  iconProps?: LucideProps;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, iconProps = {}, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    const StartIcon = startIcon;
    const EndIcon = endIcon;
    const { className: iconClassName, ...iconRest } = iconProps;

    if (type === "password") {
      return (
        <div className="relative w-full">
          <input
            autoComplete="off"
            type={!show ? type : "text"}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-4 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
          <button
            onClick={() => setShow((prev) => !prev)}
            className="absolute top-1/2 right-3 -translate-y-1/2 transform"
            type="button"
          >
            {show ? (
              <Eye className="stroke-slate-700/70" size={18} />
            ) : (
              <EyeClosed className="stroke-slate-700/70" size={18} />
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="relative w-full">
        {StartIcon && (
          <div className="absolute top-1/2 left-1.5 -translate-y-1/2 transform">
            <StartIcon
              size={18}
              className={cn("text-muted-foreground", iconClassName)}
              {...iconRest}
            />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-4 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            startIcon ? "pl-8" : "",
            endIcon ? "pr-8" : "",
            className,
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
            <EndIcon
              className={cn("text-muted-foreground", iconClassName)}
              {...iconRest}
              size={18}
            />
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
