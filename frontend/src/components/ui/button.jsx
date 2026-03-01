import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

const buttonVariants = (variant, size, className) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap font-bold uppercase tracking-widest transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"

    const variants = {
        default: "bg-primary text-white hover:bg-black shadow-lg",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
        outline: "border paper-border bg-white text-primary hover:bg-gray-50",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        ghost: "hover:bg-primary/10 text-primary hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
    }

    const sizes = {
        default: "h-11 px-8 py-4 md:px-10 md:py-5 text-sm",
        sm: "h-9 px-6 py-2.5 text-xs",
        lg: "h-14 px-10 py-6 text-sm",
        icon: "h-10 w-10",
    }

    return cn(baseStyles, variants[variant || "default"], sizes[size || "default"], className)
}

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={buttonVariants(variant, size, className)}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
