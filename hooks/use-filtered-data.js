import { useState } from 'react'
import { addDays, format, isAfter, isBefore } from 'date-fns'
import { isEqual } from 'lodash'

function useFilterByDate(data, type) {
  // STATES
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
    // eslint-disable-next-line array-callback-return
    return data.filter(item => {
      const yesterday = addDays(new Date(item[type]), -1)
      if (startDate && !endDate) {
        return (isBefore(new Date(startDate), yesterday) || (isEqual(new Date(startDate), yesterday))) && (isAfter(new Date(currentDate), yesterday) || (isEqual(new Date(currentDate), yesterday)))
      }

      if (!startDate && endDate) {
        return isAfter(new Date(endDate), yesterday) || isEqual(new Date(endDate), yesterday)
      }

      if (startDate && endDate) {
        return (isBefore(new Date(startDate), yesterday) || (isEqual(new Date(startDate), yesterday))) && (isAfter(new Date(endDate), yesterday) || (isEqual(new Date(endDate), yesterday)))
      }
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
