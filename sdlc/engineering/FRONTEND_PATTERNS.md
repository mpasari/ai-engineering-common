# FRONTEND_PATTERNS.md
# SDLC -- Engineering Stage -- Frontend Implementation Patterns
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core
#
# This file is read by:
#   - Code Gen Agent (A09) -- React component and hook patterns
#   - Accessibility Agent (A19) -- checks against required patterns
#   - Peer Review Agent (A27) -- pattern compliance check

---

## 1. Component architecture

```
Pages / Routes
  -- Next.js pages or React Router routes
  -- Minimal logic -- compose Feature components
  -- Handle route params and page-level data fetching

Feature components
  -- Self-contained feature areas (OrderList, CancellationForm)
  -- Own their local state and data fetching
  -- Composed of UI components

UI components
  -- Reusable, stateless presentation components
  -- Accept props, emit events
  -- No direct API calls or business logic
  -- Accessible by default (A01-A18 standards applied)
```

---

## 2. React patterns

### 2.1 Component structure

```tsx
// Required: named export (not default) for testability
// Required: explicit Props type
// Required: accessible markup from the start

type OrderCardProps = {
    order: Order;
    onCancel: (orderId: string) => void;
};

export function OrderCard({ order, onCancel }: OrderCardProps) {
    const handleCancel = () => onCancel(order.id);

    return (
        <article aria-label={`Order ${order.reference}`}>
            <h2>{order.reference}</h2>
            <p>Status: <span aria-live="polite">{order.status}</span></p>
            {order.canBeCancelled && (
                <button
                    type="button"
                    onClick={handleCancel}
                    aria-label={`Cancel order ${order.reference}`}
                >
                    Cancel order
                </button>
            )}
        </article>
    );
}
```

Key rules:
- Named export -- not anonymous default export
- Props typed explicitly -- never `any`
- Semantic HTML elements (button, article, section, nav)
- aria-label on interactive elements with no visible text

### 2.2 Data fetching pattern

```tsx
// Use React Query (TanStack Query) for server state
export function useOrders(customerId: string) {
    return useQuery({
        queryKey: ['orders', customerId],
        queryFn: () => orderApi.getByCustomer(customerId),
        staleTime: 30_000, // 30 seconds
    });
}

// Usage in component
export function OrderList({ customerId }: { customerId: string }) {
    const { data, isLoading, error } = useOrders(customerId);

    if (isLoading) return <LoadingSpinner aria-label="Loading orders" />;
    if (error) return <ErrorMessage message="Could not load orders" />;

    return (
        <ul aria-label="Your orders">
            {data?.map(order => (
                <li key={order.id}><OrderCard order={order} /></li>
            ))}
        </ul>
    );
}
```

### 2.3 Form pattern

```tsx
// Use React Hook Form for form state management
export function CancellationForm({ orderId, onSuccess }: Props) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const cancelMutation = useCancelOrder();

    const onSubmit = (data: FormData) => {
        cancelMutation.mutate({ orderId, reason: data.reason }, {
            onSuccess,
            onError: (err) => { /* handled by global error boundary */ },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
                <label htmlFor="reason">Cancellation reason</label>
                <textarea
                    id="reason"
                    {...register('reason', { required: 'Reason is required' })}
                    aria-describedby={errors.reason ? 'reason-error' : undefined}
                    aria-invalid={!!errors.reason}
                />
                {errors.reason && (
                    <span id="reason-error" role="alert">
                        {errors.reason.message}
                    </span>
                )}
            </div>
            <button type="submit" disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel order'}
            </button>
        </form>
    );
}
```

Key rules (enforced by Accessibility Agent A01-A18):
- label with htmlFor matching input id (A04)
- aria-describedby links input to error message (A09)
- role="alert" on error messages (A13)
- button type="submit" -- not type="button" for form submission
- Disabled state feedback to user during mutation

---

## 3. State management

```
Server state:    React Query (TanStack Query) -- API data
Form state:      React Hook Form
Local UI state:  useState / useReducer -- component scope
Global UI state: React Context -- theme, user session
```

Never use a global store (Redux, Zustand) for server state.
React Query handles caching, background refresh, and optimistic updates.

---

## 4. API client pattern

```typescript
// Centralised API client per domain
export const orderApi = {
    getByCustomer: (customerId: string): Promise<Order[]> =>
        apiClient.get(`/api/v1/orders?customerId=${customerId}`),

    cancel: (orderId: string, reason: string): Promise<Order> =>
        apiClient.post(`/api/v1/orders/${orderId}/cancel`, { reason }),
};

// Shared API client with auth and error handling
const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

apiClient.interceptors.request.use((config) => {
    const token = getToken(); // from auth session
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(
    (response) => response.data.data, // unwrap ApiResponse envelope
    (error) => Promise.reject(toAppError(error)),
);
```

---

## 5. Accessibility patterns (enforced by A19)

```tsx
// Required focus trap for modals (A05)
import { FocusTrap } from 'focus-trap-react';

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    return isOpen ? (
        <FocusTrap>
            <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <h2 id="modal-title">{title}</h2>
                {children}
                <button onClick={onClose}>Close</button>
            </div>
        </FocusTrap>
    ) : null;
}

// Required: keyboard handler for custom interactive elements (A03)
export function ClickableRow({ onClick, children }: Props) {
    return (
        <tr
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            {children}
        </tr>
    );
}
```

---

## 6. Version and review

| File owner | CoE Core + UX Lead |
| Review cadence | Quarterly |
