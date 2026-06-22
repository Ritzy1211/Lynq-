'use client';

import { useEffect } from 'react';

export function PrintButton() {
  useEffect(() => {
    // No-op; print is triggered by the button. Keeping the hook ensures CSR boot.
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white print:hidden"
    >
      Print
    </button>
  );
}
