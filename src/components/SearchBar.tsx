'use client';

interface SearchBarProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  wrapperClassName: string;
  labelClassName: string;
  inputClassName: string;
}

export function SearchBar({
  label,
  placeholder,
  value,
  onChange,
  wrapperClassName,
  labelClassName,
  inputClassName,
}: SearchBarProps) {
  return (
    <div className={wrapperClassName} style={{ marginBottom: '16px' }}>
      <label className={labelClassName}>{label}</label>
      <input
        className={inputClassName}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
