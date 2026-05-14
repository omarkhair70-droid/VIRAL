import type { HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

function cx(base: string, className?: string) { return `${base} ${className ?? ""}`; }

export function FormSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <section className={cx("space-y-field-gap", className)} {...props} />; }
export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cx("space-y-2", className)} {...props} />; }
export function Label({ required, optional, className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean; optional?: boolean }) {
  return <label className={cx("text-sm font-medium text-app-text-secondary", className)} {...props}>{children}{required ? <span className="ms-1 text-app-accent">*</span> : null}{optional ? <span className="ms-1 type-micro">(اختياري)</span> : null}</label>;
}
export function HelperText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cx("type-meta", className)} {...props} />; }
export function ErrorText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cx("text-xs font-medium text-red-700", className)} {...props} />; }

const inputBase = "w-full rounded-field border border-app-border bg-app-surface px-3 py-2.5 text-sm text-app-text-primary outline-none transition placeholder:text-app-text-muted focus:border-app-accent focus:ring-2 focus:ring-app-focus/20";
export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cx(inputBase, className)} {...props} />; }
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cx(`${inputBase} min-h-24`, className)} {...props} />; }
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cx(inputBase, className)} {...props} />; }
export function CharacterCount({ current, max, className }: { current: number; max: number; className?: string }) { return <p className={cx("type-micro", className)}>{current}/{max}</p>; }
export function FormActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cx("flex flex-wrap items-center gap-actions-gap", className)} {...props} />; }
