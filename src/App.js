// import { useEffect, useState } from "react";

// const CLIENT_ID =
//   "656749534532-42dptvndkv37s0mdgjosgf2mbgp4uh4r.apps.googleusercontent.com";

// const API_KEY = ""; // Можно оставить пустым
// const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// export default function App() {
//   const [tokenClient, setTokenClient] = useState(null);
//   const [gapiLoaded, setGapiLoaded] = useState(false);
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   // --- 1. Загружаем gapi.client ---
//   useEffect(() => {
//     window.gapi.load("client", async () => {
//       await window.gapi.client.init({});
//       await window.gapi.client.load("calendar", "v3");
//       setGapiLoaded(true);
//     });
//   }, []);

//   // --- 2. Создаём OAuth токен-клиент GIS ---
//   useEffect(() => {
//     if (!gapiLoaded) return;

//     const client = window.google.accounts.oauth2.initTokenClient({
//       client_id: CLIENT_ID,
//       scope: SCOPES,
//       callback: (response) => {
//         if (response.access_token) {
//           setIsAuthorized(true);
//         }
//       },
//     });

//     setTokenClient(client);
//   }, [gapiLoaded]);

//   const login = () => {
//     tokenClient.requestAccessToken();
//   };

//   const logout = () => {
//     window.google.accounts.oauth2.revoke(tokenClient.access_token, () => {
//       setIsAuthorized(false);
//     });
//   };

//   const createEvent = async () => {
//     const event = {
//       summary: "Событие GIS + GAPI",
//       start: {
//         dateTime: new Date().toISOString(),
//       },
//       end: {
//         dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
//       },
//     };

//     const res = await window.gapi.client.calendar.events.insert({
//       calendarId: "primary",
//       resource: event,
//     });

//     alert("Событие создано!");
//     console.log(res);
//   };

//   if (!gapiLoaded) return <div>Загрузка Google API...</div>;

//   return (
//     <div style={{ padding: 30 }}>
//       <h1>Google Calendar (новый способ) ✔</h1>

//       {!isAuthorized ? (
//         <button onClick={login}>Войти</button>
//       ) : (
//         <>
//           <button onClick={logout}>Выйти</button>
//           <br />
//           <br />
//           <button onClick={createEvent}>Создать событие</button>
//         </>
//       )}
//     </div>
//   );
// }

// // ______
// import React, { useState, useEffect } from "react";
// import AddEmployee from "./components/AddEmployee";
// import EmployeesList from "./components/EmployeesList";
// import Calendar from "./components/Calendar";
// import { rtdb } from "./firebase";
// import { ref, onValue } from "firebase/database";

// const CLIENT_ID =
//   "656749534532-42dptvndkv37s0mdgjosgf2mbgp4uh4r.apps.googleusercontent.com";
// const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// export default function App() {
//   const [employees, setEmployees] = useState([]);
//   const [gapiLoaded, setGapiLoaded] = useState(false);
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [tokenClient, setTokenClient] = useState(null);

//   // --- Загружаем GAPI
//   useEffect(() => {
//     window.gapi.load("client", async () => {
//       await window.gapi.client.init({});
//       await window.gapi.client.load("calendar", "v3");
//       setGapiLoaded(true);
//     });
//   }, []);

//   // --- Инициализация OAuth token client
//   useEffect(() => {
//     if (!gapiLoaded) return;

//     const client = window.google.accounts.oauth2.initTokenClient({
//       client_id: CLIENT_ID,
//       scope: SCOPES,
//       callback: (response) => {
//         if (response.access_token) setIsAuthorized(true);
//       },
//     });

//     setTokenClient(client);
//   }, [gapiLoaded]);

//   const login = () => {
//     tokenClient.requestAccessToken();
//   };

//   const logout = () => {
//     if (tokenClient) {
//       window.google.accounts.oauth2.revoke(tokenClient.access_token, () => {
//         setIsAuthorized(false);
//       });
//     }
//   };

//   // --- Firebase: загрузка сотрудников
//   useEffect(() => {
//     const employeesRef = ref(rtdb, "employees");
//     const unsubscribe = onValue(employeesRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const list = Object.keys(data).map((key) => ({
//           id: key,
//           ...data[key],
//         }));
//         setEmployees(list);
//       } else setEmployees([]);
//     });
//     return () => unsubscribe();
//   }, []);

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>График сотрудников</h1>

//       {!isAuthorized ? (
//         <button onClick={login} style={{ marginBottom: 20 }}>
//           Войти в Google Calendar
//         </button>
//       ) : (
//         <button onClick={logout} style={{ marginBottom: 20 }}>
//           Выйти из Google Calendar
//         </button>
//       )}

//       <AddEmployee />
//       <EmployeesList />
//       <Calendar employees={employees} isAuthorized={isAuthorized} />
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import AddEmployee from "./components/AddEmployee";
import EmployeesList from "./components/EmployeesList";
import Calendar from "./components/Calendar";
import { rtdb } from "./firebase";
import { ref, onValue } from "firebase/database";

const CLIENT_ID =
  "1068282317957-eulj4v3sm03pcl2vu5ub9cfu1shard5p.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);

  // --- Загружаем GAPI
  useEffect(() => {
    window.gapi.load("client", async () => {
      await window.gapi.client.init({});
      await window.gapi.client.load("calendar", "v3");
      setGapiLoaded(true);
    });
  }, []);

  // --- Инициализация OAuth2 token client
  useEffect(() => {
    if (!gapiLoaded) return;

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) setIsAuthorized(true);
      },
    });

    setTokenClient(client);
  }, [gapiLoaded]);

  const login = () => tokenClient.requestAccessToken();
  const logout = () => {
    if (tokenClient) {
      window.google.accounts.oauth2.revoke(tokenClient.access_token, () => {
        setIsAuthorized(false);
      });
    }
  };

  // --- Firebase: загрузка сотрудников
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
    <div style={{ padding: 20 }}>
      <h1>График сотрудников</h1>

      {!isAuthorized ? (
        <button onClick={login} style={{ marginBottom: 20 }}>
          Войти в Google Calendar
        </button>
      ) : (
        <button onClick={logout} style={{ marginBottom: 20 }}>
          Выйти из Google Calendar
        </button>
      )}

      <AddEmployee />
      <EmployeesList />
      <Calendar employees={employees} isAuthorized={isAuthorized} />
    </div>
  );
}
