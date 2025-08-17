import { forwardRef, ButtonHTMLAttributes } from 'react'

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | "neumorphic-primary" 
    | "neumorphic-secondary" 
    | "neumorphic-red" 
    | "neumorphic-green" 
    | "neumorphic-rose" 
    | "neumorphic-white" 
    | "neumorphic-tertiary"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "neumorphic-primary", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-xl h-12 sm:h-14 px-5 sm:px-6 font-medium transition-all duration-200 select-none active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    
    const variants = {
      "neumorphic-primary": "bg-sky-600 text-white shadow-[0_6px_0_0_rgb(3,105,161)] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_rgb(3,105,161)] active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(3,105,161)] dark:bg-sky-500 dark:shadow-[0_6px_0_0_rgb(2,90,140)] dark:hover:shadow-[0_4px_0_0_rgb(2,90,140)] dark:active:shadow-[0_2px_0_0_rgb(2,90,140)]",
      "neumorphic-secondary": "bg-gray-50 text-gray-700 border border-gray-200 shadow-[0_6px_0_0_rgb(229,231,235)] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_rgb(229,231,235)] active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(229,231,235)] dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:shadow-[0_6px_0_0_rgb(55,65,81)] dark:hover:shadow-[0_4px_0_0_rgb(55,65,81)] dark:active:shadow-[0_2px_0_0_rgb(55,65,81)]",
      "neumorphic-red": "bg-red-600 text-white shadow-[0_6px_0_0_rgb(185,28,28)] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_rgb(185,28,28)] active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(185,28,28)] dark:bg-red-500 dark:shadow-[0_6px_0_0_rgb(153,27,27)] dark:hover:shadow-[0_4px_0_0_rgb(153,27,27)] dark:active:shadow-[0_2px_0_0_rgb(153,27,27)]",
      "neumorphic-green": "bg-green-600 text-white shadow-[0_6px_0_0_rgb(5,46,20)] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_rgb(5,46,20)] active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(5,46,20)] dark:bg-green-500 dark:shadow-[0_6px_0_0_rgb(15,54,18)] dark:hover:shadow-[0_4px_0_0_rgb(15,54,18)] dark:active:shadow-[0_2px_0_0_rgb(15,54,18)]",
      "neumorphic-rose": "bg-rose-600 text-white shadow-[0_6px_0_0_rgb(225,29,72)] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_rgb(225,29,72)] active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(225,29,72)] dark:bg-rose-500 dark:shadow-[0_6px_0_0_rgb(190,24,93)] dark:hover:shadow-[0_4px_0_0_rgb(190,24,93)] dark:active:shadow-[0_2px_0_0_rgb(190,24,93)]",
      "neumorphic-white": "bg-white text-gray-700 border border-gray-200 shadow-[0_6px_0_0_rgb(229,231,235)] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_rgb(229,231,235)] active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(229,231,235)] dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:shadow-[0_6px_0_0_rgb(55,65,81)] dark:hover:shadow-[0_4px_0_0_rgb(55,65,81)] dark:active:shadow-[0_2px_0_0_rgb(55,65,81)]",
      "neumorphic-tertiary": "bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-[0_6px_0_0_rgb(229,229,229)] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_rgb(229,229,229)] active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(229,229,229)] dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:shadow-[0_6px_0_0_rgb(64,64,64)] dark:hover:shadow-[0_4px_0_0_rgb(64,64,64)] dark:active:shadow-[0_2px_0_0_rgb(64,64,64)]"
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }