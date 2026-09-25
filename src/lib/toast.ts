import { Listener, ToastItem } from "@/types/toast-type";

class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(toast: Omit<ToastItem, "id">) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };

    // Dynamic Island displays one active morphing pill at a time
    this.toasts = [newToast];
    this.notify();

    if (toast.type !== "loading") {
      const duration = toast.duration ?? 3800;
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  dismiss(id?: string) {
    if (id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    } else {
      this.toasts = [];
    }
    this.notify();
  }

  success(title: string, opts?: Partial<Omit<ToastItem, "id" | "title" | "type">>) {
    return this.show({ title, type: "success", ...opts });
  }

  error(title: string, opts?: Partial<Omit<ToastItem, "id" | "title" | "type">>) {
    return this.show({ title, type: "error", ...opts });
  }

  info(title: string, opts?: Partial<Omit<ToastItem, "id" | "title" | "type">>) {
    return this.show({ title, type: "info", ...opts });
  }

  loading(title: string, opts?: Partial<Omit<ToastItem, "id" | "title" | "type">>) {
    return this.show({ title, type: "loading", ...opts });
  }
}

export const islandToast = new ToastStore();