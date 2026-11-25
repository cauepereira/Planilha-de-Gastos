/**
 * Testes das funções utilitárias do MoneyMap.
 * As funções são extraídas diretamente aqui para evitar dependência
 * do módulo principal que usa import via CDN (incompatível com Jest).
 */

// ---- Funções replicadas do app.js para teste isolado ----

function fmt(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(d) {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}

function calcularSaldo(items) {
  const receitas = items
    .filter(i => i.tipo === 'receita')
    .reduce((acc, i) => acc + Number(i.valor), 0);
  const despesas = items
    .filter(i => i.tipo === 'despesa')
    .reduce((acc, i) => acc + Number(i.valor), 0);
  return receitas - despesas;
}

function calcularTotalParcelas(valorTotal, numParcelas) {
  if (!valorTotal || !numParcelas || numParcelas <= 0) return 0;
  return Number((valorTotal / numParcelas).toFixed(2));
}

// ---- Testes ----

describe('fmtDate', () => {
  test('formata data ISO para dd/mm/yyyy', () => {
    expect(fmtDate('2026-09-15')).toBe('15/09/2026');
  });

  test('retorna string vazia para valor nulo', () => {
    expect(fmtDate(null)).toBe('');
  });

  test('retorna string vazia para valor undefined', () => {
    expect(fmtDate(undefined)).toBe('');
  });

  test('formata corretamente datas com dia e mês com um dígito', () => {
    expect(fmtDate('2026-01-05')).toBe('05/01/2026');
  });
});

describe('calcularSaldo', () => {
  test('retorna zero para lista vazia', () => {
    expect(calcularSaldo([])).toBe(0);
  });

  test('soma receitas e subtrai despesas corretamente', () => {
    const items = [
      { tipo: 'receita', valor: 3000 },
      { tipo: 'receita', valor: 500 },
      { tipo: 'despesa', valor: 1200 },
      { tipo: 'despesa', valor: 300 },
    ];
    expect(calcularSaldo(items)).toBe(2000);
  });

  test('retorna saldo negativo quando despesas superam receitas', () => {
    const items = [
      { tipo: 'receita', valor: 1000 },
      { tipo: 'despesa', valor: 1500 },
    ];
    expect(calcularSaldo(items)).toBe(-500);
  });

  test('considera apenas itens com tipo reconhecido', () => {
    const items = [
      { tipo: 'receita', valor: 1000 },
      { tipo: 'outro', valor: 9999 },
    ];
    expect(calcularSaldo(items)).toBe(1000);
  });

  test('lida com valores em string (como vindos do banco)', () => {
    const items = [
      { tipo: 'receita', valor: '2000' },
      { tipo: 'despesa', valor: '800' },
    ];
    expect(calcularSaldo(items)).toBe(1200);
  });
});

describe('calcularTotalParcelas', () => {
  test('divide o valor total pelo número de parcelas', () => {
    expect(calcularTotalParcelas(1200, 12)).toBe(100);
  });

  test('arredonda para 2 casas decimais', () => {
    expect(calcularTotalParcelas(100, 3)).toBe(33.33);
  });

  test('retorna 0 para número de parcelas zero', () => {
    expect(calcularTotalParcelas(1200, 0)).toBe(0);
  });

  test('retorna 0 para valor total nulo', () => {
    expect(calcularTotalParcelas(null, 12)).toBe(0);
  });

  test('retorna 0 para número de parcelas negativo', () => {
    expect(calcularTotalParcelas(1200, -3)).toBe(0);
  });
});
