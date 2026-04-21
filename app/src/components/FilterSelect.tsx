interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  name: string;
  value?: string;
  options: FilterOption[];
  allLabel: string;
}

export default function FilterSelect({
  label,
  name,
  value,
  options,
  allLabel,
}: FilterSelectProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
