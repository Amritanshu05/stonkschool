import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-bg-subtle text-ink-muted">
          {icon}
        </div>
      ) : null}
      <div>
        <h4 className="text-base font-semibold text-ink">{title}</h4>
        {description ? (
          <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
