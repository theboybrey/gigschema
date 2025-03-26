import { cx } from '@/lib/utils';

export const VisuallyHidden = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cx(
                'absolute h-px w-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
                className
            )}
            {...props}
        />
    );
};