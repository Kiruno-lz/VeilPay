import '../happy-dom-setup';
import React from 'react';
import { describe, it, expect } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { AppStateProvider } from './AppState';
import { useAppState } from './useAppState';

describe('useAppState', () => {
  it('should return state and dispatch when used inside AppStateProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppStateProvider>{children}</AppStateProvider>
    );

    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.state).toBeDefined();
    expect(result.current.dispatch).toBeDefined();
    expect(result.current.state).not.toBeNull();
    expect(result.current.dispatch).not.toBeNull();
  });

  it('should throw error when used outside AppStateProvider', () => {
    expect(() => {
      renderHook(() => useAppState());
    }).toThrow('useAppState must be used within an AppStateProvider');
  });
});
