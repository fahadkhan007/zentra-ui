import { useState } from 'react'
import { Button } from './components/ui/button'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Button onClick={() => {
        setCount(count + 1)
      }}>button {count}</Button>
    </>
  )
}

export default App
