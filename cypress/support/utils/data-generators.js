
export const generateEmployee = () => {
  const firstNames = ['Elton', 'Whitney', 'Michael', 'Aretha', 'Janis']
  const lastNames = ['John', 'Houston', 'Jackson', 'Franklin', 'Joplin']
 
  const unique = Date.now().toString(36).slice(-4)

  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: `${lastNames[Math.floor(Math.random() * lastNames.length)]}${unique}`,
  }
}


export const generateFutureDate = (minDays = 30, maxDays = 90) => {
  const days =
    Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays

  const date = new Date()
  date.setDate(date.getDate() + days)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${day}-${month}`
}
