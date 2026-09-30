"use client"
import React, { useMemo, useState } from 'react';

export default function Parent(){
  const [count, setCount] = useState(0);
  const [items] = useState([1, 2, 3, 4, 5]);

  // Memoize filtered list (re-runs only when `items` or `count` changes)
  const filteredList = useMemo(() => {
    console.log('Filtering list...'); // Logs only when dependencies change
    return items.filter(item => item > count);
  }, [items, count]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment: {count}</button>
      <ul>
        {filteredList.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};