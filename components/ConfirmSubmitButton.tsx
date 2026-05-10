'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  message?: string;
};

export function ConfirmSubmitButton({
  children,
  className = 'btn btn-ghost w-full',
  message = 'Удалить запись?',
}: Props) {
  return (
    <button
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      type="submit"
    >
      {children}
    </button>
  );
}
