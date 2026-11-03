'use client';

import { Input } from 'informed';

export default function FormInput({ identifier, label }: { identifier: string; label: string }) {
  return (
    <label htmlFor={identifier}>
      {label}
      <Input id={identifier} name={identifier} />
    </label>
  );
}
