"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
export function DealMessageSubmitButton() { const { pending } = useFormStatus(); return <Button type="submit" size="sm" disabled={pending}>{pending ? "جاري الإرسال..." : "ابعت الرسالة"}</Button>; }
