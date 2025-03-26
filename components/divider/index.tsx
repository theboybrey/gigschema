import { cx } from "@/lib/utils"
import React from "react"

type DividerProps = React.ComponentPropsWithoutRef<"div">

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
    ({ className, children, ...props }, forwardedRef) => (
        <div
            ref={forwardedRef}
            className={cx(
                "mx-auto my-6 flex w-full items-center justify-between gap-3 text-sm",
                "text-gray-500 dark:text-gray-500",
                className,
            )}
            tremor-id="tremor-raw"
            {...props}
        >
            {children ? (
                <>
                    <div
                        className={cx(
                            "h-[1px] w-full",
                            "bg-gray-200 dark:bg-gray-800",
                        )}
                    />
                    <div className="whitespace-nowrap text-inherit">{children}</div>
                    <div
                        className={cx(
                            "h-[1px] w-full",
                            "bg-gray-200 dark:bg-gray-800",
                        )}
                    />
                </>
            ) : (
                <div
                    className={cx(
                        "h-[1px] w-full",
                        "bg-gray-200 dark:bg-gray-800",
                    )}
                />
            )}
        </div>
    ),
)

Divider.displayName = "Divider"

export { Divider }

