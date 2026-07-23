const greet = (): string => "hello";

function toLabel(value: string): string;
function toLabel(value: number): string;
function toLabel(value: string | number): string {
  return `label: ${value}`;
}

export { greet, toLabel };
