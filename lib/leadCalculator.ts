export type CalculatorLine = {
  title: string;
  quantity: string;
  price: string;
  total: string;
};

export type ParsedLeadMessage = {
  plainMessage: string;
  calculatorLines: CalculatorLine[];
  calculatorTotal: string;
};

export function parseLeadMessage(message?: string | null): ParsedLeadMessage {
  const text = message || '';
  const match = text.match(/\[calculator\]([\s\S]*?)\[\/calculator\]/);

  if (!match) {
    return { plainMessage: text.trim(), calculatorLines: [], calculatorTotal: '' };
  }

  const plainMessage = text.replace(match[0], '').trim();
  const rows = match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const calculatorLines: CalculatorLine[] = [];
  let calculatorTotal = '';

  for (const row of rows) {
    const [title = '', quantity = '', price = '', total = ''] = row.split('|').map((part) => part.trim());
    if (title.toLowerCase().startsWith('итого')) {
      calculatorTotal = total || price || quantity || '';
    } else if (title) {
      calculatorLines.push({ title, quantity, price, total });
    }
  }

  return { plainMessage, calculatorLines, calculatorTotal };
}
