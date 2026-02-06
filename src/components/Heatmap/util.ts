export const cellWidth = 12
export const gap = 4

export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const calculateMaxDaysForWidth = (width: number) => {
  const weekWidth = cellWidth + gap // 16

  // Add a safety margin (5px) to prevent sub-pixel rounding errors from causing overflow.
  const horizontalPadding = 91

  // Calculate the space available for the grid
  const gridWidthAvailable = width - horizontalPadding

  if (gridWidthAvailable <= 0) {
    return 7 // Return one week minimum
  }

  // Calculate number of whole weeks that fit.
  const weeks = Math.floor(gridWidthAvailable / weekWidth)

  const calculatedMaxDays = weeks * 7

  return Math.max(calculatedMaxDays, 7)
}
