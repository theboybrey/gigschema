"use client";
import {
    AlertTriangle,
    Loader2,
    Wifi,
    X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";
import {
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiInformationFill,
    RiWifiOffLine,
} from "@remixicon/react";

export type NotifierPosition =
    | "right-top"
    | "right-bottom"
    | "left-top"
    | "left-bottom"
    | "center-top"
    | "center-bottom";
export type NotifierType =
    | "info"
    | "success"
    | "warning"
    | "error"
    | "loading"
    | "connection-established"
    | "connection-dropped"
    | "progress";

interface NotifierProps {
    message: string;
    title?: string;
    type: NotifierType;
    position?: NotifierPosition;
    isVisible: boolean;
    onClose: () => void;
    action?: {
        label: string;
        onClick: () => void;
    };
    disableDismiss?: boolean;
    progress?: number;
}

class NotifierService {
    private static instance: NotifierService;
    private callback:
        | ((
            message: string,
            type: NotifierType,
            position?: NotifierPosition,
            title?: string,
            action?: NotifierProps["action"],
            progress?: number
        ) => void)
        | null = null;

    private constructor() { }

    static getInstance() {
        if (!NotifierService.instance) {
            NotifierService.instance = new NotifierService();
        }
        return NotifierService.instance;
    }

    setCallback(
        cb: (
            message: string,
            type: NotifierType,
            position?: NotifierPosition,
            title?: string,
            action?: NotifierProps["action"],
            progress?: number
        ) => void
    ) {
        this.callback = cb;
    }

    info(message: string, title?: string, position?: NotifierPosition, action?: NotifierProps["action"]) {
        this.callback?.(message, "info", position, title, action);
    }

    success(message: string, title?: string, position?: NotifierPosition, action?: NotifierProps["action"]) {
        this.callback?.(message, "success", position, title, action);
    }

    warning(message: string, title?: string, position?: NotifierPosition, action?: NotifierProps["action"]) {
        this.callback?.(message, "warning", position, title, action);
    }

    error(message: string, title?: string, position?: NotifierPosition, action?: NotifierProps["action"]) {
        this.callback?.(message, "error", position, title, action);
    }

    loading(message: string, title?: string, position?: NotifierPosition, action?: NotifierProps["action"]) {
        this.callback?.(message, "loading", position, title, action);
    }

    connectionEstablished(
        message: string = "Internet connection restored",
        title?: string,
        position?: NotifierPosition,
        action?: NotifierProps["action"]
    ) {
        this.callback?.(message, "connection-established", position, title, action);
    }

    connectionDropped(
        message: string = "Internet connection lost",
        title?: string,
        position?: NotifierPosition,
        action?: NotifierProps["action"]
    ) {
        this.callback?.(message, "connection-dropped", position, title, action);
    }


    progress(
        message: string,
        progress: number,
        title?: string,
        position: NotifierPosition = "center-bottom",
        action?: NotifierProps["action"]
    ) {
        this.callback?.(message, "progress", position, title, action, progress);
    }
}

export const notifier = NotifierService.getInstance();

const getPositionClasses = (position: NotifierPosition): string => {
    switch (position) {
        case "center-bottom":
            return "bottom-6 left-1/2 -translate-x-1/2";
        case "center-top":
            return "top-6 left-1/2 -translate-x-1/2";
        case "left-top":
            return "top-6 left-6";
        case "left-bottom":
            return "bottom-6 left-6";
        case "right-top":
            return "top-6 right-6";
        case "right-bottom":
            return "bottom-6 right-6";
        default:
            return "bottom-6 right-6";
    }
};

const getIconColor = (type: NotifierType): string => {
    switch (type) {
        case "success":
        case "connection-established":
            return "text-emerald-600 dark:text-emerald-500";
        case "error":
        case "connection-dropped":
            return "text-red-600 dark:text-red-500";
        case "warning":
            return "text-amber-500 dark:text-amber-500";
        case "info":
            return "text-blue-600 dark:text-blue-500";
        case "loading":
        case "progress":
            return "text-gray-600 dark:text-gray-400";
        default:
            return "text-gray-600 dark:text-gray-400";
    }
};

const Notifier: React.FC<NotifierProps> = ({
    message,
    title,
    type,
    position = "right-bottom",
    isVisible,
    onClose,
    action,
    disableDismiss = false,
    progress,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isVisible && !isHovered && !disableDismiss && type !== "progress") {
            timerRef.current = setTimeout(() => {
                onClose();
            }, 5000);

            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        }
    }, [isVisible, isHovered, onClose, disableDismiss, type]);

    const getIcon = () => {
        const iconProps = {
            className: cx("size-5 shrink-0", getIconColor(type)),
        };

        switch (type) {
            case "success":
                return <RiCheckboxCircleFill {...iconProps} />;
            case "warning":
                return <AlertTriangle {...iconProps} />;
            case "error":
                return <RiCloseCircleFill {...iconProps} />;
            case "loading":
                return <Loader2 {...iconProps} className={`${iconProps.className} animate-spin`} />;
            case "connection-established":
                return <Wifi {...iconProps} />;
            case "connection-dropped":
                return <RiWifiOffLine {...iconProps} />;
            case "progress":
                return <Loader2 {...iconProps} className={`${iconProps.className} animate-spin`} />;
            default:
                return <RiInformationFill {...iconProps} />;
        }
    };

    if (!isVisible) return null;

    if (type === "progress") {
        return createPortal(
            <div
                className={cx(
                    `fixed z-[9999] flex flex-col overflow-hidden
                    rounded-md bg-gray-900 dark:bg-gray-950 text-white
                    shadow-lg transition-all duration-200 
                    w-64 max-w-xs
                    ${getPositionClasses(position)}
                    animate-in fade-in duration-300`
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="px-3 py-2 flex items-center gap-2">
                    <Loader2 className="size-4 text-white animate-spin" />
                    <p className="text-xs font-medium text-white flex-1">{message}</p>
                    <span className="text-xs text-white/70">{progress}%</span>
                </div>
                <div className="w-full bg-gray-800/70 h-0.5">
                    <div
                        className="bg-blue-500 h-0.5 transition-all duration-300"
                        style={{ width: `${Math.min(Math.max(progress || 0, 0), 100)}%` }}
                    />
                </div>
            </div>,
            document.body
        );
    }

    // Original layout for other notification types
    return createPortal(
        <div
            className={cx(
                `fixed z-[9999] m-4 flex max-w-md overflow-hidden rounded-lg
                bg-white dark:bg-gray-950
                border border-gray-300/40 dark:border-gray-800/40
                shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
                transition-all duration-200
                hover:border-gray-300/60 dark:hover:border-gray-700/60
                hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]
                group data-[state=open]:animate-slideLeftAndFade data-[state=closed]:animate-hide
                ${getPositionClasses(position)}
                data-[swipe=cancel]:translate-x-0 
                data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]
                data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
                data-[swipe=move]:transition-none`
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-1 items-start gap-3 p-4">
                {getIcon()}
                <div className="flex flex-1 flex-col gap-0.5">
                    {title && (
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>
                </div>
                {!disableDismiss && (
                    <button
                        onClick={onClose}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 
                        hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-md -mr-1 -mt-1"
                    >
                        <X className="size-4 text-gray-500 dark:text-gray-400" />
                    </button>
                )}
            </div>
            {action && (
                <div className="border-t border-gray-100 dark:border-gray-800/60 px-4 py-3">
                    <button
                        onClick={action.onClick}
                        className={cx(
                            "text-sm font-medium transition-colors",
                            {
                                "text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400":
                                    type === "error" || type === "connection-dropped",
                                "text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400":
                                    type === "info",
                                "text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400":
                                    type === "success" || type === "connection-established",
                                "text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400":
                                    type === "warning",
                                "text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300":
                                    type === "loading",
                            }
                        )}
                    >
                        {action.label}
                    </button>
                </div>
            )}
        </div>,
        document.body
    );
};

const NotifierContainer: React.FC = () => {
    const [state, setState] = useState({
        isVisible: false,
        message: "",
        title: undefined as string | undefined,
        type: "info" as NotifierType,
        position: "right-bottom" as NotifierPosition,
        action: undefined as NotifierProps["action"] | undefined,
        progress: undefined as number | undefined,
    });

    useEffect(() => {
        notifier.setCallback((msg, tp, pos, ttl, act, prog) => {
            setState({
                isVisible: true,
                message: msg,
                type: tp,
                position: pos || (tp === "progress" ? "center-bottom" : "right-bottom"),
                title: ttl,
                action: act,
                progress: prog,
            });
        });
    }, []);

    const handleClose = () => {
        setState(prev => ({ ...prev, isVisible: false }));
    };

    return <Notifier {...state} onClose={handleClose} />;
};

export default NotifierContainer;