import * as React from "react"

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-100",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }