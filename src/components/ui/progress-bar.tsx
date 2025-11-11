import clsx from 'clsx';

interface ProgressBarProps {
  percent: number;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export const ProgressBar = ({ percent, tone = 'default' }: ProgressBarProps) => (
  <div className="h-2 w-full rounded-full bg-slate-100">
    <div
      className={clsx(
        'h-full rounded-full transition-[width] duration-500',
        {
          default: 'bg-slate-500',
          success: 'bg-emerald-500',
          warning: 'bg-amber-500',
          danger: 'bg-rose-500',
        }[tone],
      )}
      style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
    />
  </div>
);
