const express = require('express');

const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

app.use(express.json());

function parsePositiveNumber(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Поле "${fieldName}" обязательно`);
  }

  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw new Error(`Поле "${fieldName}" должно быть числом`);
  }

  if (num <= 0) {
    throw new Error(`Поле "${fieldName}" должно быть больше нуля`);
  }

  return num;
}

function parseNonNegativeNumber(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Поле "${fieldName}" обязательно`);
  }

  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw new Error(`Поле "${fieldName}" должно быть числом`);
  }

  if (num < 0) {
    throw new Error(`Поле "${fieldName}" не может быть отрицательным`);
  }

  return num;
}

function calculateLoan(amount, annualRate, months) {
  if (annualRate === 0) {
    const monthlyPayment = amount / months;
    return {
      monthlyPayment: roundMoney(monthlyPayment),
      totalOverpayment: 0,
    };
  }

  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const monthlyPayment = (amount * monthlyRate * factor) / (factor - 1);
  const totalPaid = monthlyPayment * months;
  const totalOverpayment = totalPaid - amount;

  return {
    monthlyPayment: roundMoney(monthlyPayment),
    totalOverpayment: roundMoney(totalOverpayment),
  };
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

app.post('/calculate', (req, res) => {
  try {
    const amount = parsePositiveNumber(req.body.amount, 'amount');
    const rate = parseNonNegativeNumber(req.body.rate, 'rate');
    const months = parsePositiveNumber(req.body.months, 'months');

    if (!Number.isInteger(months)) {
      return res.status(400).json({
        error: 'Поле "months" должно быть целым числом',
      });
    }

    const result = calculateLoan(amount, rate, months);

    return res.json({
      monthlyPayment: result.monthlyPayment,
      totalOverpayment: result.totalOverpayment,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
