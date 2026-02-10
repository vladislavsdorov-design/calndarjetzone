import React, { useState } from "react";
import { rtdb } from "../firebase";
import { ref, push } from "firebase/database";

export default function AddEmployee() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const addEmployee = async () => {
    if (!name || !email) {
      alert("Заполните все поля");
      return;
    }

    setLoading(true);
    try {
      await push(ref(rtdb, "employees"), { name, email });
      setName("");
      setEmail("");
      alert("Сотрудник добавлен!");
    } catch (err) {
      console.error(err);
      alert("Ошибка добавления сотрудника");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>Добавить сотрудника</h3>
      <input
        type="text"
        placeholder="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <button onClick={addEmployee} disabled={loading}>
        {loading ? "Добавление..." : "Добавить"}
      </button>
    </div>
  );
}
