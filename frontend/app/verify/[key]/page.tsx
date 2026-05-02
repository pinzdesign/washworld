"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VerifyPage() {
  const { key } = useParams();
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!key) return;

    fetch(`${baseURL}/verify/${key}`)
      .then(async (res) => {
        const text = await res.text();
        setMessage(text);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Verification failed");
      });
  }, [key]);

  return (
    <main>
      <h1>Email Verification</h1>
      <p>{message}</p>
    </main>
  );
}