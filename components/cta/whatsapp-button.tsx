import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type WhatsAppButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  message?: string;
};

export function WhatsAppButton({
  children,
  className,
  variant = "primary",
  size = "lg",
  message,
}: WhatsAppButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={cn(className)}>
      <a
        href={getWhatsAppUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="h-4 w-4" />
        {children}
      </a>
    </Button>
  );
}
