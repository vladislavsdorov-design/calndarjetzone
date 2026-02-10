import React, { useState, useEffect } from "react";
import { rtdb } from "../firebase";
import { ref, onValue } from "firebase/database";

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const employeesRef = ref(rtdb, "employees");
    const unsubscribe = onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setEmployees(list);
      } else setEmployees([]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h3>Сотрудники</h3>
      <ul>
        {employees.map((e) => (
          <li key={e.id}>
            {e.name} — {e.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
