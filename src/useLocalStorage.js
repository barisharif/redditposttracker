import { useState, useEffect } from "react";

export function useLocalStorage(key, initialState) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
      try {
        // Attempt to parse the stored JSON value
        const parsedValue = JSON.parse(storedValue);
        // Additional check to ensure parsedValue is an array if initialState is an array
        if (Array.isArray(initialState) && !Array.isArray(parsedValue)) {
          console.error(`Expected an array for ${key}, but received:`, parsedValue);
          return initialState;
        }
        return parsedValue;
      } catch (error) {
        console.error('Error reading from local storage', error);
        return initialState;
      }
    } else {
      return initialState;
    }
  });

  useEffect(() => {
    // Serialize and save to local storage
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to local storage', error);
    }
  }, [key, value]);

  return [value, setValue];
}
