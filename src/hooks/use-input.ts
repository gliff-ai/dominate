import { ChangeEvent, useState } from "react";

export function useInput(initialValue: string | null) {
  const [value, setValue] = useState<string | null>(initialValue);

  return {
    value,
    setValue,
    reset: () => setValue(null),
    bind: {
      value,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      },
    },
  };
}
