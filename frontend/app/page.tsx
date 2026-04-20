"use client";

import { useEffect, useState } from "react";

type TestItem = {
  test_id: number;
  test_message: string;
};

export default function Home() {
  const [data, setData] = useState<TestItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/test")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main>
      <h1>Wash World</h1>
          {data.map((item) => (
            <div key={item.test_id}>
              {item.test_message}
            </div>
          ))}
    </main>
  );
}