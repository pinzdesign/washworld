"use client";

import { useState } from "react";
import Register from "./Register";

export default function Login() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  const [user_email, setEmail] = useState("");
  const [user_password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async () => {
    const formData = new FormData();
    formData.append("user_email", user_email);
    formData.append("user_password", user_password);

    try {
      const res = await fetch(`${baseURL}/login`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage(text);
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);

      setMessage("Logged in!");
    } catch (err) {
      console.error(err);
      setMessage("Error logging in");
    }
  };

  if (showRegister) {
    return (
      <div>
        <Register />
        <button onClick={() => setShowRegister(false)}>
          Tilbage
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <button onClick={() => setShowRegister(true)}>
        Ny Bruger
      </button>

      <p>{message}</p>
    </div>
  );
}