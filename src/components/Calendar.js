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
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setShifts(list);
      } else setShifts([]);
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
