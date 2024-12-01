import { FC, useEffect, useState } from 'react'

export const Clock: FC = () => {
  const [time, setTime] = useState(
    `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
  )

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTime(
        `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      )
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [])

  return <div>{time}</div>
}
