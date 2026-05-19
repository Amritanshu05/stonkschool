import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function PageHeader({ title, description, actions, meta }: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>
        ) : null}
        {meta ? <div className="mt-3">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
