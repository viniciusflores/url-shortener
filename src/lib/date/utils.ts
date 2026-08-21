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

export {
  getExpiredDate,
  getExpiryDateInYears,
  getExpiryDatePlusOneYear,
  getExpiryDatePlusTwoYears,
  isExpired,
};
