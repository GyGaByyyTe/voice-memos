import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that includes common providers
 * @param ui The React component to render
 * @param options Additional render options
 * @returns The render result plus userEvent
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  // Return render result with userEvent
  return {
    user: userEvent,
    ...render(ui, options),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
