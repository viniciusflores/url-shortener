function getExpiredDate(): Date {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - 1);
  return expiredDate;
}

function getExpiryDateInYears(years: number): Date {
  const expiryDate = new Date();
  expiryDate.setUTCFullYear(expiryDate.getUTCFullYear() + years);
  return expiryDate;
}

function getExpiryDatePlusOneYear(): Date {
  return getExpiryDateInYears(1);
}

function getExpiryDatePlusTwoYears(): Date {
  return getExpiryDateInYears(2);
}

function isExpired(expiryDate: Date): boolean {
  return Date.now() > expiryDate.getTime();
}

function getStartOfUTCDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function addUTCDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export {
  addUTCDays,
  getStartOfUTCDay,
  getExpiredDate,
  getExpiryDateInYears,
  getExpiryDatePlusOneYear,
  getExpiryDatePlusTwoYears,
  isExpired,
};
