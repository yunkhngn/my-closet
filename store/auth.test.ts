import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/auth';

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loading: true });
  });

  it('starts in loading state with no user', () => {
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.loading).toBe(true);
  });

  it('setUser stores the user and clears loading', () => {
    useAuthStore.getState().setUser({ uid: 'abc', displayName: 'Ann' } as never);
    const s = useAuthStore.getState();
    expect(s.user?.uid).toBe('abc');
    expect(s.loading).toBe(false);
  });

  it('setUser(null) clears the user and loading', () => {
    useAuthStore.getState().setUser(null);
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.loading).toBe(false);
  });
});
