const convertSecondsToDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`
}

module.exports = convertSecondsToDuration
