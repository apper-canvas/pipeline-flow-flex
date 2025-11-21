import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "default", 
  children,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-primary-500 text-white shadow hover:bg-primary-600 active:bg-primary-700",
    secondary: "bg-secondary-100 text-secondary-700 hover:bg-secondary-200 active:bg-secondary-300",
    outline: "border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 active:bg-secondary-100",
    ghost: "text-secondary-600 hover:bg-secondary-100 active:bg-secondary-200",
    accent: "bg-accent-500 text-white shadow hover:bg-accent-600 active:bg-accent-700",
    danger: "bg-error-500 text-white shadow hover:bg-error-600 active:bg-error-700"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg"
  };
  
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;