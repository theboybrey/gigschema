import React from "react"
import * as AccordionPrimitives from "@radix-ui/react-accordion"
import { RiAddLine } from "@remixicon/react"

import { cx } from "@/lib/utils"

const Accordion = AccordionPrimitives.Root

Accordion.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitives.Trigger>
>(({ className, children, ...props }, forwardedRef) => (
    <AccordionPrimitives.Header className="flex">
        <AccordionPrimitives.Trigger
            className={cx(
                "group flex flex-1 cursor-pointer items-center justify-between py-3 text-left text-sm font-medium leading-none",
                "text-gray-900 dark:text-gray-50",
                "data-[disabled]:cursor-default data-[disabled]:text-gray-400 dark:data-[disabled]:text-gray-600",
                "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
                className,
            )}
            {...props}
            ref={forwardedRef}
        >
            {children}
            <RiAddLine
                className={cx(
                    "size-5 shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.87,_0,_0.13,_1)] &rsqb; group-data-[state=open]:-rotate-45",
                    "text-gray-400 dark:text-gray-600",
                    "group-data-[disabled]:text-gray-300 group-data-[disabled]:dark:text-gray-700",
                )}
                aria-hidden="true"
                focusable="false"
            />
        </AccordionPrimitives.Trigger>
    </AccordionPrimitives.Header>
))

AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitives.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitives.Content>
>(({ className, children, ...props }, forwardedRef) => (
    <AccordionPrimitives.Content
        ref={forwardedRef}
        className={cx(
            "transform-gpu data-[state=closed]:animate-accordionClose data-[state=open]:animate-accordionOpen",
        )}
        {...props}
    >
        <div
            className={cx(
                "overflow-hidden pb-4 text-sm",
                "text-gray-700 dark:text-gray-200",
                className,
            )}
        >
            {children}
        </div>
    </AccordionPrimitives.Content>
))

AccordionContent.displayName = "AccordionContent"

const AccordionItem = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitives.Item>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitives.Item>
>(({ className, ...props }, forwardedRef) => (
    <AccordionPrimitives.Item
        ref={forwardedRef}
        className={cx(
            "overflow-hidden border-b first:mt-0",
            "border-gray-200 dark:border-gray-800",
            className,
        )}
        tremor-id="tremor-raw"
        {...props}
    />
))

AccordionItem.displayName = "AccordionItem"

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }