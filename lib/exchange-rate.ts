const USD_MNT_RATE = 3569.33

/**
 * Returns the USD-MNT exchange rate.
 */
export async function getUsdMntRate(): Promise<number> {
  return USD_MNT_RATE
}

/**
 * Converts USD amount to MNT using current exchange rate.
 * Returns the amount rounded to nearest whole number.
 */
export async function convertUsdToMnt(usdAmount: number): Promise<{
  mntAmount: number
  rate: number
}> {
  const rate = await getUsdMntRate()
  return {
    mntAmount: Math.round(usdAmount * rate),
    rate,
  }
}
