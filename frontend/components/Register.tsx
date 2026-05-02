"use client";

import { useState } from "react";

export default function Register() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState({
    user_email: "",
    user_password: "",
    confirm_password: "",
    user_first_name: "",
    user_last_name: "",
    user_phone: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async () => {
    // Frontend validation - check passwords match BEFORE sending request
    if (form.user_password !== form.confirm_password) {
      setMessage("Passwords do not match");
      return;
    }

    const formData = new FormData();

    // don't send confirm_password to backend (reassemble form data while excluding confirm_password)
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "confirm_password") {
        formData.append(key, value);
      }
    });

    try {
      const res = await fetch(`${baseURL}/signup`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      if (!res.ok) {
        setMessage(text);
        return;
      }

      setMessage(text);
    } catch (err) {
      console.error(err);
      setMessage("Error signing up");
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input
        name="user_email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input
        name="user_password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <input
        name="confirm_password"
        type="password"
        placeholder="Confirm Password"
        onChange={handleChange}
      />

      <input
        name="user_first_name"
        placeholder="First Name"
        onChange={handleChange}
      />

      <input
        name="user_last_name"
        placeholder="Last Name"
        onChange={handleChange}
      />

      <input
        name="user_phone"
        placeholder="Phone (8 digits)"
        onChange={handleChange}
      />

      <button onClick={handleSignup}>Sign up</button>

      <p>{message}</p>
    </div>
  );
}