import { useState } from 'react'
import { addDays, format, isAfter, isBefore, isEqual } from 'date-fns'

function useFilterByDate (data, type = '', date, delivery) {
  // STATES
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  if (!data || !data.length) return {}

  // VARIABLES
  const currentDate = format(new Date(), 'yyyy-MM-dd')
  const hasDateFilter = startDate || endDate

  // FUNCTIONS
  const startDateChangeHandler = (event) => setStartDate(event.target.value)
  const endDateChangeHandler = (event) => setEndDate(event.target.value)
  const clearInputsClickHandler = () => {
    setStartDate('')
    setEndDate('')
  }

  const filterByRangeDate = (data, startDate, endDate) => {
    const startDateFormat = startDate ? format(addDays(new Date(startDate), 1), 'yyyy-MM-dd') : null
    const endDateFormat = endDate ? format(addDays(new Date(endDate), 1), 'yyyy-MM-dd') : null

    if (type === 'plants') {
      return data.filter(item => {
        const itemDate = format(new Date(item[date]), 'yyyy-MM-dd')
        const deliveryDate = item[delivery] ? format(new Date(item[delivery]), 'yyyy-MM-dd') : null
        console.log(deliveryDate)
        console.log(deliveryDate)
        if (startDateFormat && !endDateFormat) {
          const validation = (
            isAfter(new Date(itemDate), new Date(startDateFormat)) ||
            isAfter(new Date(deliveryDate), new Date(startDateFormat)) ||
            isEqual(new Date(itemDate), new Date(startDateFormat)) ||
            isEqual(new Date(deliveryDate), new Date(startDateFormat))
          )
          return validation
        }

        if (!startDateFormat && endDateFormat) {
          const validation = (
            isBefore(new Date(itemDate), new Date(endDateFormat)) ||
            isEqual(new Date(itemDate), new Date(endDateFormat)) ||
            isBefore(new Date(deliveryDate), new Date(endDateFormat)) ||
            isEqual(new Date(deliveryDate), new Date(endDateFormat))
          )
          return validation
        }

        if (startDateFormat && endDateFormat) {
          const validation = (
            (
              (isBefore(new Date(startDateFormat), new Date(itemDate)) && isAfter(new Date(endDateFormat), new Date(itemDate))) ||
              (isBefore(new Date(startDateFormat), new Date(deliveryDate)) && isAfter(new Date(endDate), new Date(deliveryDate)))
            ) ||
            (
              (isEqual(new Date(startDateFormat), new Date(itemDate)) && isAfter(new Date(endDateFormat), new Date(itemDate))) ||
              (isEqual(new Date(startDateFormat), new Date(deliveryDate)) && isAfter(new Date(endDateFormat), new Date(deliveryDate)))
            ) ||
            (
              (isBefore(new Date(startDateFormat), new Date(itemDate)) && isEqual(new Date(endDateFormat), new Date(itemDate))) ||
              (isBefore(new Date(startDateFormat), new Date(deliveryDate)) && isEqual(new Date(endDateFormat), new Date(deliveryDate)))
            ) ||
            (
              (isEqual(new Date(startDateFormat), new Date(itemDate)) && isEqual(new Date(endDateFormat), new Date(itemDate))) ||
              (isEqual(new Date(startDateFormat), new Date(deliveryDate)) && isEqual(new Date(endDateFormat), new Date(deliveryDate)))
            )

          )
          return validation
        }

        return null
      })
    }
    return data.filter(item => {
      const dateType = format(new Date(item[date]), 'yyyy-MM-dd')

      if (startDateFormat && !endDateFormat) {
        return (
          isBefore(new Date(startDateFormat), new Date(dateType)) ||
          (isEqual(new Date(startDateFormat), new Date(dateType)) && isAfter(new Date(currentDate), new Date(dateType))) ||
          isEqual(new Date(currentDate), new Date(dateType))
        )
      }

      if (!startDateFormat && endDateFormat) {
        return (
          isAfter(new Date(endDateFormat), new Date(dateType)) ||
          isEqual(new Date(endDateFormat), new Date(dateType))
        )
      }

      if (startDateFormat && endDateFormat) {
        return (
          isBefore(new Date(startDateFormat), new Date(dateType)) ||
          (isEqual(new Date(startDateFormat), new Date(dateType)) && isAfter(new Date(endDateFormat), new Date(dateType))) ||
          isEqual(new Date(endDateFormat), new Date(dateType))
        )
      }
      return null
    })
  }

  const filteredData = !hasDateFilter
    ? data
    : filterByRangeDate(data, startDate, endDate)

  return {
    startDate,
    endDate,
    currentDate,
    startDateChangeHandler,
    endDateChangeHandler,
    clearInputsClickHandler,
    filteredData
  }
}

export default useFilterByDate
