"use client";

import { useEffect, useState } from "react";

type User = {
  first_name: string;
  last_name: string;
  email: string;
};

export default function UserProfile() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in");
      return;
    }

    fetch(`${baseURL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          setMessage(text);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        if (data.message) {
          setMessage(data.message);
        } else {
          setUser(data.user);
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("Error fetching user");
      });
  }, []);

  if (message) return <p>{message}</p>;

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>User Profile</h2>
      <p>First Name: {user.first_name}</p>
      <p>Last Name: {user.last_name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}