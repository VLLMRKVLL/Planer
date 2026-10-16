import { Host, Picker } from "@expo/ui";

export type SelectOption<T extends string> = {
  id: T;
  name: string;
};

type SelectProps<T extends string> = {
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Select<T extends string>({
  options,
  value,
  onChange,
}: SelectProps<T>) {
  return (
    <Host matchContents>
      <Picker selectedValue={value} onValueChange={(id) => onChange(id as T)}>
        {options.map((o) => (
          <Picker.Item key={o.id} label={o.name} value={o.id} />
        ))}
      </Picker>
    </Host>
  );
}
