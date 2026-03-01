import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../lib/utils"

const buttonVariants = (variant, size, className) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap font-semibold uppercase tracking-widest transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"

    const variants = {
        default: "bg-primary text-primary-foreground hover:opacity-90 shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
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
