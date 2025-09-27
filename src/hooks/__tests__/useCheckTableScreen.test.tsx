import { renderHook } from '@testing-library/react';
import { act } from '@testing-library/react';
import useCheckTableScreen from '../useCheckTableScreen';

describe('useCheckTableScreen', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalInnerWidth
    });
  });

  it('should return true when window width is less than or equal to 1850', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1800
    });

    const { result } = renderHook(() => useCheckTableScreen());
    expect(result.current).toBe(true);
  });

  it('should return false when window width is greater than 1850', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1900
    });

    const { result } = renderHook(() => useCheckTableScreen());
    expect(result.current).toBe(false);
  });

  it('should update value when window is resized', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1900
    });

    const { result } = renderHook(() => useCheckTableScreen());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: 1800
      });
      
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useCheckTableScreen());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    
    removeEventListenerSpy.mockRestore();
  });
});