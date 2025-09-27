import { renderHook } from '@testing-library/react';
import { act } from '@testing-library/react';
import { useDebounce } from '../useDabounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('should debounce function calls', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 1000));
    const debouncedFn = result.current;

    act(() => {
      debouncedFn('test1');
      debouncedFn('test2');
      debouncedFn('test3');
    });

    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenLastCalledWith('test3');
  });

  it('should use default delay of 1000ms when no delay is provided', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFn));
    const debouncedFn = result.current;

    act(() => {
      debouncedFn('test');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple arguments correctly', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 500));
    const debouncedFn = result.current;

    act(() => {
      debouncedFn('test', 123, { foo: 'bar' });
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockFn).toHaveBeenCalledWith('test', 123, { foo: 'bar' });
  });

  it('should cancel pending debounced calls when unmounted', () => {
    const mockFn = jest.fn();
    const { result, unmount } = renderHook(() => useDebounce(mockFn, 1000));
    const debouncedFn = result.current;

    act(() => {
      debouncedFn('test');
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should reset timer on subsequent calls', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 1000));
    const debouncedFn = result.current;

    act(() => {
      debouncedFn('test1');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    act(() => {
      debouncedFn('test2');
    });

    act(() => {
      jest.advanceTimersByTime(800);
    });

    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test2');
  });

  it('should preserve the function context and type safety', () => {
    interface TestObject {
      value: string;
      testMethod(newValue: string): void;
    }

    const testObject: TestObject = {
      value: 'initial',
      testMethod(newValue: string) {
        this.value = newValue;
      }
    };

    const { result } = renderHook(() => 
      useDebounce<(newValue: string) => void>(
        testObject.testMethod.bind(testObject),
        500
      )
    );
    const debouncedFn = result.current;

    act(() => {
      debouncedFn('updated');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(testObject.value).toBe('updated');
  });
});