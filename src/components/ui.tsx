import { type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 " +
  "active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

const buttonVariants = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:outline-blue-600",
  secondary:
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-slate-400",
  success:
    "bg-green-600 text-white shadow-sm hover:bg-green-700 hover:shadow-md focus-visible:outline-green-600",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus-visible:outline-red-600",
  ghost:
    "text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-400",
} as const;

const buttonSizes = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      ) : null}
      <input
        {...props}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
      />
    </div>
  );
}

export function Select({
  label,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      ) : null}
      <select
        {...props}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
      >
        {children}
      </select>
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      ) : null}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-slate-500">
      {message}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="animate-fade-in rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="animate-fade-in flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
      <span className="text-base">✓</span>
      {message}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
