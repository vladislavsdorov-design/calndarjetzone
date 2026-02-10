// import React, { useState } from "react";
// import { rtdb } from "../firebase";
// import { ref, push } from "firebase/database";

// export default function DayShiftModal({
//   date,
//   employees,
//   onClose,
//   isAuthorized,
// }) {
//   const [employeeId, setEmployeeId] = useState("");
//   const [start, setStart] = useState("09:00");
//   const [end, setEnd] = useState("18:00");

//   const saveShift = async () => {
//     if (!employeeId) return alert("Выберите сотрудника");

//     try {
//       // --- Сохраняем в Firebase
//       await push(ref(rtdb, "shifts"), { employeeId, date, start, end });
//       // Внутри saveShift:
//       if (isAuthorized && window.gapi?.client) {
//         const emp = employees.find((e) => e.id === employeeId);
//         const event = {
//           summary: `Смена: ${emp?.name || "Сотрудник"}`,
//           start: { dateTime: new Date(`${date}T${start}`).toISOString() },
//           end: { dateTime: new Date(`${date}T${end}`).toISOString() },
//         };
//         await window.gapi.client.calendar.events.insert({
//           calendarId: "primary",
//           resource: event,
//         });
//       }

//       // --- Сохраняем в Google Calendar, если авторизован
//       if (isAuthorized && window.gapi?.client) {
//         const emp = employees.find((e) => e.id === employeeId);
//         const event = {
//           summary: `Смена: ${emp?.name || "Сотрудник"}`,
//           start: { dateTime: new Date(`${date}T${start}`).toISOString() },
//           end: { dateTime: new Date(`${date}T${end}`).toISOString() },
//         };

//         await window.gapi.client.calendar.events.insert({
//           calendarId: "primary",
//           resource: event,
//         });

//         alert("Смена добавлена в Firebase и Google Calendar!");
//       } else {
//         alert("Смена добавлена только в Firebase");
//       }

//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert("Ошибка при добавлении смены");
//     }
//   };

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 50,
//         left: "50%",
//         transform: "translateX(-50%)",
//         background: "white",
//         padding: 20,
//         border: "1px solid black",
//       }}
//     >
//       <h3>Добавить смену ({date})</h3>

//       <select
//         value={employeeId}
//         onChange={(e) => setEmployeeId(e.target.value)}
//       >
//         <option value="">Выберите сотрудника</option>
//         {employees.map((e) => (
//           <option key={e.id} value={e.id}>
//             {e.name}
//           </option>
//         ))}
//       </select>

//       <div>
//         <input
//           type="time"
//           value={start}
//           onChange={(e) => setStart(e.target.value)}
//         />
//         {" – "}
//         <input
//           type="time"
//           value={end}
//           onChange={(e) => setEnd(e.target.value)}
//         />
//       </div>

//       <button onClick={saveShift}>Сохранить</button>
//       <button onClick={onClose}>Отмена</button>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { rtdb } from "../firebase";
import { ref, onValue } from "firebase/database";
import DayShiftModal from "./DayShiftModal";

export default function Calendar({ employees, isAuthorized, tokenClient }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const shiftsRef = ref(rtdb, "shifts");
    const unsubscribe = onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data)
        setShifts(Object.keys(data).map((key) => ({ id: key, ...data[key] })));
      else setShifts([]);
    });
    return () => unsubscribe();
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div>
      <h3>Февраль 2024</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
        }}
      >
        {days.map((day) => {
          const dateStr = `2024-02-${String(day).padStart(2, "0")}`;
          const dayShifts = shifts.filter((s) => s.date === dateStr);

          return (
            <div
              key={day}
              onClick={() => setSelectedDate(dateStr)}
              style={{
                border: "1px solid gray",
                padding: 10,
                minHeight: 80,
                cursor: "pointer",
              }}
            >
              <b>{day}</b>
              {dayShifts.map((s) => {
                const emp = employees.find((e) => e.id === s.employeeId);
                return (
                  <div key={s.id} style={{ fontSize: 12, marginTop: 5 }}>
                    {emp ? emp.name : "Неизвестный сотрудник"}
                    <div>
                      {s.start} - {s.end}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <DayShiftModal
          date={selectedDate}
          employees={employees}
          onClose={() => setSelectedDate(null)}
          isAuthorized={isAuthorized}
          tokenClient={tokenClient}
        />
      )}
    </div>
  );
}
