export type ToastType = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type Listener = (toasts: ToastItem[]) => void;