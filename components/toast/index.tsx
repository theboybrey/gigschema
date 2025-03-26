import * as ToastPrimitives from "@radix-ui/react-toast"
import {
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiErrorWarningFill,
    RiInformationFill,
    RiLoader4Fill,
    RiCloseLine,
} from "@remixicon/react"
import React from "react"
import { cx } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, forwardedRef) => (
    <ToastPrimitives.Viewport
        ref={forwardedRef}
        className={cx(
            "fixed right-0 top-0 z-[9999] m-0 flex w-full max-w-[100vw] list-none flex-col gap-2 p-[var(--viewport-padding)] [--viewport-padding:_15px] sm:max-w-md sm:gap-4",
            className,
        )}
        {...props}
    />
))

interface ActionProps {
    label: string
    altText: string
    onClick: () => void | Promise<void>
}

interface ToastProps
    extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
    variant?: "info" | "success" | "warning" | "error" | "loading"
    title?: string
    description?: string
    action?: ActionProps
    disableDismiss?: boolean
}

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    ToastProps
>(
    (
        {
            className,
            variant,
            title,
            description,
            action,
            disableDismiss = false,
            ...props
        }: ToastProps,
        forwardedRef,
    ) => {
        let Icon: React.ReactNode

        switch (variant) {
            case "success":
                Icon = (
                    <RiCheckboxCircleFill
                        className="size-5 shrink-0 text-emerald-600 dark:text-emerald-500"
                        aria-hidden="true"
                    />
                )
                break
            case "warning":
                Icon = (
                    <RiErrorWarningFill
                        className="size-5 shrink-0 text-amber-500 dark:text-amber-500"
                        aria-hidden="true"
                    />
                )
                break
            case "error":
                Icon = (
                    <RiCloseCircleFill
                        className="size-5 shrink-0 text-red-600 dark:text-red-500"
                        aria-hidden="true"
                    />
                )
                break
            case "loading":
                Icon = (
                    <RiLoader4Fill
                        className="size-5 shrink-0 animate-spin text-gray-600 dark:text-gray-500"
                        aria-hidden="true"
                    />
                )
                break
            default:
                Icon = (
                    <RiInformationFill
                        className="size-5 shrink-0 text-blue-500 dark:text-blue-500"
                        aria-hidden="true"
                    />
                )
                break
        }

        return (
            <ToastPrimitives.Root
                ref={forwardedRef}
                className={cx(
                    "group relative flex max-h-48 w-full overflow-hidden rounded-lg border shadow-lg shadow-black/5",
                    "bg-white/95 backdrop-blur-sm dark:bg-gray-900/95",
                    "border-gray-200/50 dark:border-gray-800/50",
                    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
                    "data-[state=open]:animate-slideLeftAndFade data-[state=closed]:animate-hide",
                    "hover:border-gray-300 dark:hover:border-gray-700",
                    className,
                )}
                {...props}
            >
                <div
                    className={cx(
                        "relative flex flex-1 items-start gap-3 p-4",
                        action ? "pb-4" : "pb-4"
                    )}
                >
                    {Icon}
                    <div className="flex flex-col gap-1 overflow-auto">
                        {title && (
                            <ToastPrimitives.Title className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                                {title}
                            </ToastPrimitives.Title>
                        )}
                        {description && (
                            <ToastPrimitives.Description className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                {description}
                            </ToastPrimitives.Description>
                        )}
                    </div>

                    {!disableDismiss && (
                        <ToastPrimitives.Close
                            className={cx(
                                "absolute right-2 top-2 rounded-full p-1",
                                "text-gray-400 opacity-0 transition-opacity",
                                "hover:bg-gray-100 hover:text-gray-900",
                                "dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                                "group-hover:opacity-100",
                                action ? "top-1" : "top-2", // Adjust position for close button if action exists
                            )}
                            aria-label="Close"
                        >
                            <RiCloseLine className="size-4" />
                        </ToastPrimitives.Close>
                    )}

                    {action && (
                        <div className="flex gap-2  border-gray-200/50  px-4 my-6 py-2 dark:border-gray-800/50 dark:bg-gray-800/50">
                            <ToastPrimitives.Action
                                altText={action.altText}
                                className={cx(
                                    "ml-auto text-sm font-medium",
                                    {
                                        "text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400": variant === "error",
                                        "text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400": variant === "info",
                                        "text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400": variant === "success",
                                        "text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400": variant === "warning",
                                    }
                                )}
                                onClick={(event) => {
                                    event.preventDefault()
                                    action.onClick()
                                }}
                                type="button"
                            >
                                {action.label}
                            </ToastPrimitives.Action>
                        </div>
                    )}
                </div>
            </ToastPrimitives.Root>
        )
    },
)

Toast.displayName = "Toast"
ToastViewport.displayName = "ToastViewport"
ToastProvider.displayName = "ToastProvider"

type ToastActionElement = ActionProps

export {
    Toast,
    ToastProvider,
    ToastViewport,
    type ToastActionElement,
    type ToastProps,
}