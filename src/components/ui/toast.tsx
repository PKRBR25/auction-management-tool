import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success';
}

export function toast({ title, description, variant = 'default' }: ToastOptions) {
  const getStyle = () => {
    switch (variant) {
      case 'destructive':
        return {
          style: {
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
          },
        };
      case 'success':
        return {
          style: {
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
          },
        };
      default:
        return {
          style: {
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            color: '#374151',
          },
        };
    }
  };

  return hotToast(
    (t) => (
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <button
          onClick={() => hotToast.dismiss(t.id)}
          className="text-xs opacity-50 hover:opacity-100"
        >
          Dismiss
        </button>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right',
      ...getStyle(),
    }
  );
}
