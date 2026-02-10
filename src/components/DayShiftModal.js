import React, { useState } from "react";
import { rtdb } from "../firebase";
import { ref, push } from "firebase/database";

export default function DayShiftModal({
  date,
  employees,
  onClose,
  isAuthorized,
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  const saveShift = async () => {
    if (!employeeId) return alert("Выберите сотрудника");

    try {
      // --- Сохраняем в Firebase
      await push(ref(rtdb, "shifts"), { employeeId, date, start, end });
      // Внутри saveShift:
      if (isAuthorized && window.gapi?.client) {
        const emp = employees.find((e) => e.id === employeeId);
        const event = {
          summary: `Смена: ${emp?.name || "Сотрудник"}`,
          start: { dateTime: new Date(`${date}T${start}`).toISOString() },
          end: { dateTime: new Date(`${date}T${end}`).toISOString() },
        };
        await window.gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });
      }

      // --- Сохраняем в Google Calendar, если авторизован
      if (isAuthorized && window.gapi?.client) {
        const emp = employees.find((e) => e.id === employeeId);
        const event = {
          summary: `Смена: ${emp?.name || "Сотрудник"}`,
          start: { dateTime: new Date(`${date}T${start}`).toISOString() },
          end: { dateTime: new Date(`${date}T${end}`).toISOString() },
        };

        await window.gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });

        alert("Смена добавлена в Firebase и Google Calendar!");
      } else {
        alert("Смена добавлена только в Firebase");
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении смены");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 50,
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        padding: 20,
        border: "1px solid black",
      }}
    >
      <h3>Добавить смену ({date})</h3>

      <select
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      >
        <option value="">Выберите сотрудника</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      <div>
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        {" – "}
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

      <button onClick={saveShift}>Сохранить</button>
      <button onClick={onClose}>Отмена</button>
    </div>
  );
}
