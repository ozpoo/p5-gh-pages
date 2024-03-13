import { useState, useEffect } from 'react'
import { Hook, Console as ConsoleFeed, Decode } from 'console-feed'
 
export default function Console() {
	const [logs, setLogs] = useState([])

	useEffect(() => {
    Hook(window.console, log => {
      setLogs([...logs, Decode(log)])
    })
  }, [])

	return <ConsoleFeed logs={logs} variant='dark' />
}