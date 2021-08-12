import { useState } from "react";

export function useInput<T>(initialValue: T | null) {
  const [value, setValue] = useState<T | null>(initialValue);

  return {
    value,
    setValue,
    reset: () => setValue(null),
    bind: {
      value,
      onChange: (event) => {
        setValue(event.target.value);
      },
    },
  };
}
