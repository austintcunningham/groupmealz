import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ease-out " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0";

const buttonVariants = {
  primary:
    "bg-[var(--geaux-red)] text-white shadow-[var(--geaux-shadow-sm)] hover:bg-[var(--geaux-red-dark)] hover:shadow-[var(--geaux-shadow-md)] focus-visible:outline-[var(--geaux-red)]",
  secondary:
    "border border-[var(--geaux-yellow)] bg-white text-[var(--geaux-charcoal)] shadow-[var(--geaux-shadow-sm)] hover:bg-[var(--geaux-yellow-light)]/40 focus-visible:outline-[var(--geaux-yellow)]",
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
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-[var(--geaux-shadow-sm)] transition-all duration-200 hover:border-slate-300 focus:border-[var(--geaux-red)] focus:outline-none focus:ring-2 focus:ring-[var(--geaux-yellow-light)] focus:shadow-[var(--geaux-shadow-md)] ${className}`}
      />
    </div>
  );
}

export function Textarea({
  label,
  hint,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <div>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      ) : null}
      {hint ? <p className="mb-1.5 text-xs text-slate-500">{hint}</p> : null}
      <textarea
        {...props}
        className={`min-h-[5rem] w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-[var(--geaux-shadow-sm)] transition-all duration-200 hover:border-slate-300 focus:border-[var(--geaux-red)] focus:outline-none focus:ring-2 focus:ring-[var(--geaux-yellow-light)] focus:shadow-[var(--geaux-shadow-md)] ${className}`}
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
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-[var(--geaux-shadow-sm)] transition-all duration-200 hover:border-slate-300 focus:border-[var(--geaux-red)] focus:outline-none focus:ring-2 focus:ring-[var(--geaux-yellow-light)] focus:shadow-[var(--geaux-shadow-md)] ${className}`}
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
  id,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-[var(--geaux-radius-lg)] border border-[var(--geaux-border)] bg-white p-5 shadow-[var(--geaux-shadow-sm)] transition-all duration-200 hover:shadow-[var(--geaux-shadow-md)] ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      ) : null}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[var(--geaux-radius-lg)] border border-[var(--geaux-border)] bg-white p-5 shadow-[var(--geaux-shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--geaux-shadow-md)]">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--geaux-radius-lg)] border border-dashed border-slate-200 bg-white/60 p-10 text-center text-slate-500 shadow-[var(--geaux-shadow-sm)]">
      <p className="mx-auto max-w-sm text-sm leading-relaxed">{message}</p>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="animate-fade-in rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-[var(--geaux-shadow-sm)]">
      {message}
    </div>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="animate-fade-in flex items-center gap-2 rounded-xl border border-green-200/80 bg-green-50/90 px-4 py-3 text-sm text-green-900 shadow-[var(--geaux-shadow-sm)]">
      <span className="text-base">✓</span>
      {message}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[var(--geaux-yellow-light)] border-t-[var(--geaux-red)]" />
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
