// import { useEffect, useState } from "react";
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set, onValue, remove } from "firebase/database";

// // Firebase конфигурация
// const firebaseConfig = {
//   apiKey: "AIzaSyCSnUlsCQIXk0XiLmua1dNiVj-Vag3hxc0",
//   authDomain: "baza-ee8e7.firebaseapp.com",
//   databaseURL:
//     "https://baza-ee8e7-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "baza-ee8e7",
//   storageBucket: "baza-ee8e7.firebasestorage.app",
//   messagingSenderId: "656749534532",
//   appId: "1:656749534532:web:c24eb1712b7b2944614b11",
//   measurementId: "G-HMTKWG50QW",
// };

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// const CLIENT_ID =
//   "1068282317957-eulj4v3sm03pcl2vu5ub9cfu1shard5p.apps.googleusercontent.com";
// const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// // Цвета Google Calendar
// const GOOGLE_COLORS = [
//   { id: 1, name: "Лавандовый", hex: "#7986cb" },
//   { id: 2, name: "Зеленый", hex: "#33b679" },
//   { id: 3, name: "Фиолетовый", hex: "#8e24aa" },
//   { id: 4, name: "Коралловый", hex: "#e67c73" },
//   { id: 5, name: "Желтый", hex: "#f6bf26" },
//   { id: 6, name: "Оранжевый", hex: "#f4511e" },
//   { id: 7, name: "Голубой", hex: "#039be5" },
//   { id: 8, name: "Лаймовый", hex: "#c0ca33" },
//   { id: 9, name: "Серый", hex: "#616161" },
//   { id: 10, name: "Индиго", hex: "#3f51b5" },
//   { id: 11, name: "Темно-зеленый", hex: "#0b8043" },
// ];

// const USER_COLORS = GOOGLE_COLORS.map((c) => c.hex);
// const COLOR_MAPPING = {};
// GOOGLE_COLORS.forEach((color) => {
//   COLOR_MAPPING[color.hex] = color.id;
// });

// const formatDateToYMD = (date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const calculateHoursDiff = (startTime, endTime) => {
//   const [startHour, startMinute] = startTime.split(":").map(Number);
//   const [endHour, endMinute] = endTime.split(":").map(Number);
//   const startTotal = startHour * 60 + startMinute;
//   const endTotal = endHour * 60 + endMinute;
//   let diff = endTotal - startTotal;
//   if (diff < 0) diff += 24 * 60;
//   return diff / 60;
// };

// export default function App() {
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [events, setEvents] = useState({}); // Опубликованные события (ЦВЕТНЫЕ)
//   const [pendingEvents, setPendingEvents] = useState([]); // Ожидающие публикации (СЕРЫЕ)
//   const [users, setUsers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [showStatsModal, setShowStatsModal] = useState(false);
//   const [showBulkModal, setShowBulkModal] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [authWindow, setAuthWindow] = useState(null);
//   const [bulkPublishing, setBulkPublishing] = useState(false);

//   // Режим массовой публикации
//   const [bulkMode, setBulkMode] = useState(false);

//   // Форма создания/редактирования смены
//   const [eventForm, setEventForm] = useState({
//     id: null,
//     title: "",
//     date: formatDateToYMD(new Date()),
//     startTime: "09:00",
//     endTime: "18:00",
//     userIds: [], // МАССИВ - можно выбрать НЕСКОЛЬКИХ сотрудников
//     sendEmail: true,
//     isPending: false,
//   });

//   const [bulkForm, setBulkForm] = useState({
//     selectedEvents: [],
//     sendEmail: true,
//   });

//   const [newUser, setNewUser] = useState({
//     name: "",
//     email: "",
//     color: USER_COLORS[0],
//   });

//   const [stats, setStats] = useState({});

//   // Инициализация
//   useEffect(() => {
//     loadInitialData();
//     const token = localStorage.getItem("google_token");
//     if (token) {
//       setIsAuthorized(true);
//       verifyToken(token);
//     }
//     window.addEventListener("message", handleAuthMessage);
//     return () => {
//       window.removeEventListener("message", handleAuthMessage);
//       if (authWindow) authWindow.close();
//     };
//   }, []);

//   // Статистика
//   useEffect(() => {
//     calculateStatistics();
//   }, [events, users]);

//   const calculateStatistics = () => {
//     const newStats = {};
//     users.forEach((user) => {
//       const userEvents = Object.values(events).filter(
//         (e) => e.userId === user.id
//       );
//       const totalShifts = userEvents.length;
//       let totalHours = 0;
//       userEvents.forEach((event) => {
//         totalHours += calculateHoursDiff(event.startTime, event.endTime);
//       });
//       newStats[user.id] = {
//         user,
//         totalShifts,
//         totalHours: parseFloat(totalHours.toFixed(1)),
//         averageHoursPerShift:
//           totalShifts > 0
//             ? parseFloat((totalHours / totalShifts).toFixed(1))
//             : 0,
//       };
//     });
//     setStats(newStats);
//   };

//   const handleAuthMessage = (event) => {
//     if (event.origin !== window.location.origin) return;
//     if (event.data.type === "google_auth_success") {
//       const token = event.data.token;
//       localStorage.setItem("google_token", token);
//       setIsAuthorized(true);
//       if (authWindow) {
//         authWindow.close();
//         setAuthWindow(null);
//       }
//     }
//   };

//   const verifyToken = async (token) => {
//     try {
//       const response = await fetch(
//         "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + token
//       );
//       const data = await response.json();
//       if (data.error) {
//         localStorage.removeItem("google_token");
//         setIsAuthorized(false);
//       }
//     } catch (error) {
//       console.error("Ошибка проверки токена:", error);
//     }
//   };

//   const loadInitialData = async () => {
//     setIsLoading(true);
//     await loadUsersFromFirebase();
//     await loadEventsFromFirebase();
//     // Загружаем ожидающие события из localStorage
//     const savedPending = localStorage.getItem("pendingEvents");
//     if (savedPending) {
//       try {
//         setPendingEvents(JSON.parse(savedPending));
//       } catch (e) {
//         setPendingEvents([]);
//       }
//     }
//     setIsLoading(false);
//   };

//   const loadUsersFromFirebase = () => {
//     const usersRef = ref(db, "users");
//     onValue(usersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const usersMap = new Map();
//         Object.values(data).forEach((user) => {
//           if (user && user.id) {
//             usersMap.set(user.id, user);
//           }
//         });
//         const uniqueUsers = Array.from(usersMap.values());
//         setUsers(uniqueUsers);
//       } else {
//         setUsers([]);
//       }
//     });
//   };

//   const loadEventsFromFirebase = () => {
//     const eventsRef = ref(db, "calendarEvents");
//     onValue(eventsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setEvents(data);
//       } else {
//         setEvents({});
//       }
//     });
//   };

//   // Сохраняем ожидающие события в localStorage
//   const savePendingEvents = (newPendingEvents) => {
//     setPendingEvents(newPendingEvents);
//     localStorage.setItem("pendingEvents", JSON.stringify(newPendingEvents));
//   };

//   const loginWithGoogle = () => {
//     const redirectUri = encodeURIComponent(window.location.origin);
//     const scope = encodeURIComponent(SCOPES);
//     const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;
//     const width = 500;
//     const height = 600;
//     const left = (window.screen.width - width) / 2;
//     const top = (window.screen.height - height) / 2;
//     const win = window.open(
//       authUrl,
//       "Google Auth",
//       `width=${width},height=${height},left=${left},top=${top}`
//     );
//     setAuthWindow(win);
//   };

//   useEffect(() => {
//     const hash = window.location.hash;
//     if (hash.includes("access_token=")) {
//       const token = hash.split("access_token=")[1].split("&")[0];
//       localStorage.setItem("google_token", token);
//       setIsAuthorized(true);
//       window.location.hash = "";
//       window.history.replaceState(null, null, window.location.pathname);
//     }
//   }, []);

//   const logout = () => {
//     localStorage.removeItem("google_token");
//     setIsAuthorized(false);
//   };

//   const saveEventToFirebase = async (eventData, eventId = null) => {
//     const id = eventId || Date.now().toString();
//     const eventRef = ref(db, `calendarEvents/${id}`);
//     await set(eventRef, { ...eventData, id });
//     return id;
//   };

//   const deleteEventFromFirebase = async (eventId) => {
//     const eventRef = ref(db, `calendarEvents/${eventId}`);
//     await remove(eventRef);
//   };

//   const getGoogleCalendarColor = (userColor) => {
//     return COLOR_MAPPING[userColor] || 1;
//   };

//   const createGoogleCalendarEvent = async (eventData, user) => {
//     const token = localStorage.getItem("google_token");
//     if (!token) return null;

//     const [year, month, day] = eventData.date.split("-").map(Number);
//     const [startHour, startMinute] = eventData.startTime.split(":").map(Number);
//     const [endHour, endMinute] = eventData.endTime.split(":").map(Number);

//     const startDateTime = new Date(
//       year,
//       month - 1,
//       day,
//       startHour,
//       startMinute
//     );
//     const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

//     const event = {
//       summary: `${user.name} — ${eventData.title || "Смена"}`,
//       start: {
//         dateTime: startDateTime.toISOString(),
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       end: {
//         dateTime: endDateTime.toISOString(),
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       description: `Сотрудник: ${user.name}\nEmail: ${user.email}\nСмена: ${
//         eventData.title || "Рабочая смена"
//       }`,
//       colorId: getGoogleCalendarColor(user.color).toString(),
//     };

//     if (user?.email && eventData.sendEmail) {
//       event.attendees = [
//         {
//           email: user.email,
//           displayName: user.name,
//           responseStatus: "needsAction",
//         },
//       ];
//     }

//     try {
//       const queryParams = new URLSearchParams();
//       if (eventData.sendEmail && user?.email) {
//         queryParams.append("sendUpdates", "all");
//       }
//       const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`;
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(event),
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.removeItem("google_token");
//           setIsAuthorized(false);
//         }
//         return null;
//       }
//       const data = await response.json();
//       return data.id;
//     } catch (error) {
//       console.error("Ошибка создания события в Google Calendar:", error);
//       return null;
//     }
//   };

//   // ============= ПУБЛИКАЦИЯ ОЖИДАЮЩИХ СОБЫТИЙ =============
//   const publishBulkEvents = async () => {
//     if (bulkForm.selectedEvents.length === 0) {
//       alert("Выберите события для публикации");
//       return;
//     }

//     if (!isAuthorized) {
//       alert("Для публикации нужно войти в Google Calendar");
//       return;
//     }

//     setBulkPublishing(true);

//     const publishedEvents = [];
//     let successCount = 0;
//     let failCount = 0;

//     for (const eventId of bulkForm.selectedEvents) {
//       const event = pendingEvents.find((e) => e.id === eventId);
//       if (!event) continue;

//       const user = users.find((u) => u.id === event.userId);
//       if (!user) continue;

//       const googleEventId = await createGoogleCalendarEvent(event, user);

//       if (googleEventId) {
//         const savedEventId = await saveEventToFirebase({
//           ...event,
//           googleEventId,
//           createdAt: new Date().toISOString(),
//           isPending: false,
//         });
//         publishedEvents.push({ ...event, googleEventId, id: savedEventId });
//         successCount++;
//       } else {
//         failCount++;
//       }
//     }

//     // ОБНОВЛЯЕМ СОБЫТИЯ - СЕРЫЕ СТАНОВЯТСЯ ЦВЕТНЫМИ
//     if (publishedEvents.length > 0) {
//       setEvents((prev) => {
//         const newEvents = { ...prev };
//         publishedEvents.forEach((event) => {
//           newEvents[event.id] = event;
//         });
//         return newEvents;
//       });
//     }

//     // Удаляем опубликованные из ожидающих
//     const newPendingEvents = pendingEvents.filter(
//       (e) => !bulkForm.selectedEvents.includes(e.id)
//     );
//     savePendingEvents(newPendingEvents);

//     setBulkForm({ selectedEvents: [], sendEmail: true });
//     setBulkPublishing(false);
//     setShowBulkModal(false);

//     alert(`✅ Опубликовано: ${successCount}\n❌ Ошибок: ${failCount}`);
//   };

//   const toggleBulkMode = () => {
//     setBulkMode(!bulkMode);
//   };

//   // ============= СОЗДАНИЕ НОВОЙ СМЕНЫ =============
//   const handleCreateEvent = async () => {
//     if (!eventForm.title.trim()) {
//       alert("Введите название смены");
//       return;
//     }

//     if (eventForm.userIds.length === 0) {
//       alert("Выберите хотя бы одного сотрудника");
//       return;
//     }

//     if (bulkMode) {
//       // РЕЖИМ МАССОВОЙ ПУБЛИКАЦИИ - создаем ОТДЕЛЬНЫЕ смены для каждого сотрудника
//       const newPendingEvents = eventForm.userIds.map((userId) => {
//         const user = users.find((u) => u.id === userId);
//         return {
//           ...eventForm,
//           userId, // Каждая смена для одного сотрудника
//           id: `pending_${Date.now()}_${userId}_${Math.random()
//             .toString(36)
//             .substr(2, 6)}`,
//           createdAt: new Date().toISOString(),
//           isPending: true,
//           user,
//         };
//       });

//       savePendingEvents([...pendingEvents, ...newPendingEvents]);
//       alert(`✅ Добавлено ${newPendingEvents.length} смен в список ожидания`);
//     } else {
//       // ОБЫЧНЫЙ РЕЖИМ - публикуем сразу для КАЖДОГО выбранного сотрудника
//       const createdEvents = [];
//       let successCount = 0;

//       for (const userId of eventForm.userIds) {
//         const user = users.find((u) => u.id === userId);
//         if (!user) continue;

//         let googleEventId = null;
//         if (isAuthorized) {
//           googleEventId = await createGoogleCalendarEvent(eventForm, user);
//         }

//         const newEvent = {
//           ...eventForm,
//           userId,
//           googleEventId,
//           createdAt: new Date().toISOString(),
//           isPending: false,
//         };

//         const savedEventId = await saveEventToFirebase(newEvent);
//         newEvent.id = savedEventId;

//         createdEvents.push(newEvent);
//         successCount++;
//       }

//       setEvents((prev) => {
//         const newEvents = { ...prev };
//         createdEvents.forEach((event) => {
//           newEvents[event.id] = event;
//         });
//         return newEvents;
//       });

//       alert(`✅ Создано ${successCount} смен`);
//     }

//     // Закрываем модалку и сбрасываем форму
//     setShowModal(false);
//     setEventForm({
//       id: null,
//       title: "",
//       date: formatDateToYMD(new Date()),
//       startTime: "09:00",
//       endTime: "18:00",
//       userIds: [],
//       sendEmail: true,
//       isPending: false,
//     });
//   };

//   // ============= РЕДАКТИРОВАНИЕ СМЕНЫ =============
//   const handleEditEvent = (event, isPending = false) => {
//     setEventForm({
//       id: event.id,
//       title: event.title,
//       date: event.date,
//       startTime: event.startTime,
//       endTime: event.endTime,
//       userIds: [event.userId], // Редактируем конкретную смену - один сотрудник
//       sendEmail: event.sendEmail !== undefined ? event.sendEmail : true,
//       isPending: isPending,
//     });
//     setShowModal(true);
//   };

//   // ============= ОБНОВЛЕНИЕ СМЕНЫ =============
//   const handleUpdateEvent = async () => {
//     if (!eventForm.id) return;

//     if (!eventForm.title.trim()) {
//       alert("Введите название смены");
//       return;
//     }

//     if (eventForm.userIds.length === 0) {
//       alert("Выберите сотрудника");
//       return;
//     }

//     const userId = eventForm.userIds[0]; // Берем первого (единственного) сотрудника
//     const user = users.find((u) => u.id === userId);
//     if (!user) return;

//     const updatedEvent = {
//       ...eventForm,
//       userId,
//       updatedAt: new Date().toISOString(),
//     };

//     if (eventForm.isPending) {
//       // Редактируем ожидающее событие
//       const updatedPendingEvents = pendingEvents.map((e) =>
//         e.id === eventForm.id ? { ...e, ...updatedEvent, user } : e
//       );
//       savePendingEvents(updatedPendingEvents);
//       alert(`✅ Смена обновлена в списке ожидания`);
//     } else {
//       // Редактируем опубликованное событие
//       if (isAuthorized && events[eventForm.id]?.googleEventId) {
//         await deleteGoogleCalendarEvent(events[eventForm.id].googleEventId);
//       }

//       let googleEventId = null;
//       if (isAuthorized) {
//         googleEventId = await createGoogleCalendarEvent(eventForm, user);
//       }

//       updatedEvent.googleEventId =
//         googleEventId || events[eventForm.id]?.googleEventId;

//       await saveEventToFirebase(updatedEvent, eventForm.id);

//       setEvents((prev) => ({
//         ...prev,
//         [eventForm.id]: updatedEvent,
//       }));

//       alert(`✅ Смена обновлена`);
//     }

//     setShowModal(false);
//     setEventForm({
//       id: null,
//       title: "",
//       date: formatDateToYMD(new Date()),
//       startTime: "09:00",
//       endTime: "18:00",
//       userIds: [],
//       sendEmail: true,
//       isPending: false,
//     });
//   };

//   const deleteGoogleCalendarEvent = async (googleEventId) => {
//     const token = localStorage.getItem("google_token");
//     if (!token) return;
//     try {
//       await fetch(
//         `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}?sendUpdates=all`,
//         {
//           method: "DELETE",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//     } catch (error) {
//       console.error("Ошибка удаления события из Google Calendar:", error);
//     }
//   };

//   // ============= УДАЛЕНИЕ СМЕНЫ =============
//   const handleDeleteEvent = async (eventId, isPending = false) => {
//     if (!window.confirm("Удалить эту смену?")) return;

//     if (isPending) {
//       const newPendingEvents = pendingEvents.filter((e) => e.id !== eventId);
//       savePendingEvents(newPendingEvents);
//     } else {
//       const event = events[eventId];
//       if (isAuthorized && event?.googleEventId) {
//         await deleteGoogleCalendarEvent(event.googleEventId);
//       }
//       await deleteEventFromFirebase(eventId);

//       setEvents((prev) => {
//         const newEvents = { ...prev };
//         delete newEvents[eventId];
//         return newEvents;
//       });
//     }

//     if (eventForm.id === eventId) {
//       setShowModal(false);
//       setEventForm({
//         id: null,
//         title: "",
//         date: formatDateToYMD(new Date()),
//         startTime: "09:00",
//         endTime: "18:00",
//         userIds: [],
//         sendEmail: true,
//         isPending: false,
//       });
//     }
//   };

//   // ============= КЛИК ПО ДНЮ =============
//   const handleDateClick = (date) => {
//     const dateStr = formatDateToYMD(date);
//     setSelectedDate(dateStr);

//     // Получаем ВСЕ события на эту дату
//     const publishedEventsOnDate = Object.values(events).filter(
//       (e) => e.date === dateStr
//     );
//     const pendingEventsOnDate = pendingEvents.filter((e) => e.date === dateStr);

//     const allEventsOnDate = [
//       ...publishedEventsOnDate.map((e) => ({ ...e, isPending: false })),
//       ...pendingEventsOnDate.map((e) => ({ ...e, isPending: true })),
//     ];

//     if (allEventsOnDate.length === 0) {
//       // Нет событий - создаем новое (можно выбрать НЕСКОЛЬКИХ сотрудников)
//       setEventForm({
//         id: null,
//         title: "",
//         date: dateStr,
//         startTime: "09:00",
//         endTime: "18:00",
//         userIds: [], // Пустой массив - можно выбрать несколько
//         sendEmail: true,
//         isPending: false,
//       });
//       setShowModal(true);
//     } else {
//       // Если есть несколько событий - показываем первое (можно доработать)
//       const firstEvent = allEventsOnDate[0];
//       handleEditEvent(firstEvent, firstEvent.isPending);
//     }
//   };

//   // ============= КЛИК ПО КОНКРЕТНОЙ СМЕНЕ =============
//   const handleShiftClick = (e, event, isPending) => {
//     e.stopPropagation();
//     handleEditEvent(event, isPending);
//   };

//   // ============= ПЕРЕКЛЮЧЕНИЕ ВЫБОРА СОТРУДНИКА =============
//   const toggleUserSelection = (userId) => {
//     setEventForm((prev) => {
//       // Если редактируем - только один сотрудник
//       if (prev.id) {
//         return { ...prev, userIds: [userId] };
//       }
//       // Если создаем - можно несколько
//       const newUserIds = prev.userIds.includes(userId)
//         ? prev.userIds.filter((id) => id !== userId)
//         : [...prev.userIds, userId];
//       return { ...prev, userIds: newUserIds };
//     });
//   };

//   // ============= ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ =============
//   const handleAddUser = async () => {
//     if (!newUser.name.trim() || !newUser.email.trim()) {
//       alert("Заполните имя и email");
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(newUser.email)) {
//       alert("Введите корректный email");
//       return;
//     }

//     const existingUser = users.find(
//       (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
//     );
//     if (existingUser) {
//       alert(`Пользователь с email ${newUser.email} уже существует`);
//       return;
//     }

//     const newUserId = `user_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;
//     const userToAdd = {
//       ...newUser,
//       id: newUserId,
//       isActive: true,
//       createdAt: new Date().toISOString(),
//     };

//     const userRef = ref(db, `users/${newUserId}`);
//     await set(userRef, userToAdd);

//     setNewUser({ name: "", email: "", color: USER_COLORS[0] });
//     setShowUserModal(false);

//     alert(`✅ Сотрудник "${userToAdd.name}" добавлен`);
//   };

//   const handleDeleteUser = async (userId) => {
//     const user = users.find((u) => u.id === userId);
//     if (!user) return;

//     if (
//       window.confirm(
//         `Удалить сотрудника "${user.name}"?\n\nВсе его смены также будут удалены.`
//       )
//     ) {
//       const userRef = ref(db, `users/${userId}`);
//       await remove(userRef);

//       const userEvents = Object.values(events).filter(
//         (e) => e.userId === userId
//       );
//       for (const event of userEvents) {
//         await handleDeleteEvent(event.id, false);
//       }

//       const newPendingEvents = pendingEvents.filter((e) => e.userId !== userId);
//       savePendingEvents(newPendingEvents);
//     }
//   };

//   const getUserById = (userId) => {
//     return users.find((user) => user.id === userId);
//   };

//   // ============= ПОЛУЧИТЬ ВСЕ СОБЫТИЯ НА ДАТУ =============
//   const getAllEventsForDate = (dateStr) => {
//     const published = Object.values(events)
//       .filter((e) => e.date === dateStr)
//       .map((event) => ({
//         ...event,
//         user: getUserById(event.userId),
//         isPending: false,
//       }));

//     const pending = pendingEvents
//       .filter((e) => e.date === dateStr)
//       .map((event) => ({
//         ...event,
//         user: getUserById(event.userId),
//         isPending: true,
//       }));

//     return [...published, ...pending].filter((event) => event.user);
//   };

//   const getDaysInMonth = (year, month) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (year, month) => {
//     const day = new Date(year, month, 1).getDay();
//     return day === 0 ? 6 : day - 1;
//   };

//   const navigateMonth = (direction) => {
//     setCurrentDate((prev) => {
//       const newDate = new Date(prev);
//       newDate.setMonth(prev.getMonth() + direction);
//       return newDate;
//     });
//   };

//   const [selectedDate, setSelectedDate] = useState(null);
//   const [hoveredEvent, setHoveredEvent] = useState(null);

//   // ============= ОТОБРАЖЕНИЕ КАЛЕНДАРЯ =============
//   const renderCalendar = () => {
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const daysInMonth = getDaysInMonth(year, month);
//     const firstDay = getFirstDayOfMonth(year, month);

//     const days = [];

//     for (let i = 0; i < firstDay; i++) {
//       days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(year, month, day);
//       const dateStr = formatDateToYMD(date);
//       const dayEvents = getAllEventsForDate(dateStr);
//       const hasEvent = dayEvents.length > 0;
//       const isToday = formatDateToYMD(new Date()) === dateStr;
//       const hasPending = dayEvents.some((e) => e.isPending);

//       days.push(
//         <div
//           key={day}
//           className={`calendar-day ${hasEvent ? "has-event" : ""} ${
//             isToday ? "today" : ""
//           } ${selectedDate === dateStr ? "selected" : ""}`}
//           onClick={() => handleDateClick(date)}
//         >
//           <div className="day-number">{day}</div>

//           {/* ============= КВАДРАТ СМЕНЫ ============= */}
//           {hasEvent && (
//             <div className="shift-square">
//               {dayEvents.map((event) => (
//                 <div
//                   key={event.id}
//                   className={`shift-item ${event.isPending ? "pending" : ""}`}
//                   style={{
//                     backgroundColor: event.user?.color || "#4A90E2",
//                     opacity: event.isPending ? 0.55 : 1, // СЕРЫЕ = opacity 0.55, ЦВЕТНЫЕ = opacity 1
//                     borderLeft: event.isPending
//                       ? "3px solid rgba(0,0,0,0.2)"
//                       : "none",
//                   }}
//                   onClick={(e) => handleShiftClick(e, event, event.isPending)}
//                 >
//                   <span className="shift-initial">
//                     {event.user?.name?.charAt(0) || "?"}
//                   </span>
//                   <span className="shift-time">{event.startTime}</span>
//                   {event.isPending && (
//                     <span className="shift-pending-badge">⏳</span>
//                   )}
//                 </div>
//               ))}
//               {dayEvents.length > 4 && (
//                 <div className="shift-more">+{dayEvents.length - 4}</div>
//               )}
//             </div>
//           )}

//           {/* Индикатор ожидающих публикации */}
//           {hasPending && (
//             <div className="pending-indicator">
//               <span className="pending-dot"></span>
//               <span className="pending-count">
//                 {dayEvents.filter((e) => e.isPending).length}
//               </span>
//             </div>
//           )}
//         </div>
//       );
//     }

//     return days;
//   };

//   if (isLoading) {
//     return (
//       <div className="loading-screen">
//         <div className="loading-spinner" />
//         <div className="loading-text">Загрузка календаря...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="app-container">
//       {/* Шапка */}
//       <header className="app-header">
//         <div className="header-left">
//           <h1 className="app-title">Календарь смен</h1>
//           <div className="google-status">
//             {isAuthorized ? (
//               <span className="status-connected">
//                 <span className="status-dot" />
//                 Google Calendar
//               </span>
//             ) : (
//               <button className="btn-google" onClick={loginWithGoogle}>
//                 Подключить Google
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="header-actions">
//           {/* Переключатель режима массовой публикации */}
//           <div className="bulk-mode-toggle">
//             <span className="toggle-label">Массовая публикация</span>
//             <button
//               className={`toggle-switch ${bulkMode ? "active" : ""}`}
//               onClick={toggleBulkMode}
//             >
//               <span className="toggle-handle"></span>
//             </button>
//           </div>

//           <button
//             className={`btn-icon ${
//               pendingEvents.length > 0 ? "has-badge" : ""
//             }`}
//             onClick={() => setShowBulkModal(true)}
//             disabled={pendingEvents.length === 0}
//           >
//             {pendingEvents.length > 0 && (
//               <span className="btn-icon-badge">{pendingEvents.length}</span>
//             )}
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M10 4V16M4 10H16"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Ожидают</span>
//           </button>

//           <button className="btn-icon" onClick={() => setShowStatsModal(true)}>
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M2 18H18M4 14L6 9L9 13L13 7L16 11L18 9"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Статистика</span>
//           </button>

//           <button className="btn-icon" onClick={() => setShowUserModal(true)}>
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M14 6C14 8.20914 12.2091 10 10 10C7.79086 10 6 8.20914 6 6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6Z"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//               />
//               <path
//                 d="M2 18C2 15.7909 3.79086 14 6 14H14C16.2091 14 18 15.7909 18 18"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Сотрудники ({users.length})</span>
//           </button>

//           {isAuthorized && (
//             <button className="btn-icon" onClick={logout}>
//               <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                 <path
//                   d="M7 4H5C3.89543 4 3 4.89543 3 6V14C3 15.1046 3.89543 16 5 16H7M13 12L16 10M16 10L13 8M16 10H8"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 />
//               </svg>
//               <span>Выйти</span>
//             </button>
//           )}
//         </div>
//       </header>

//       {/* Индикатор режима */}
//       <div
//         className={`mode-indicator ${bulkMode ? "bulk-mode" : "normal-mode"}`}
//       >
//         <div className="mode-icon">{bulkMode ? "📦" : "⚡"}</div>
//         <div className="mode-text">
//           <strong>
//             {bulkMode ? "Режим массовой публикации" : "Обычный режим"}
//           </strong>
//           <span>
//             {bulkMode
//               ? "Смены добавляются в список ожидания и отображаются СЕРЫМ цветом"
//               : "Смены публикуются в Google Calendar сразу (ЦВЕТНЫЕ)"}
//           </span>
//         </div>
//       </div>

//       {/* Навигация месяца */}
//       <div className="month-nav">
//         <button className="month-nav-btn" onClick={() => navigateMonth(-1)}>
//           <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//             <path
//               d="M12 16L6 10L12 4"
//               stroke="currentColor"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//             />
//           </svg>
//         </button>
//         <h2 className="month-title">
//           {currentDate.toLocaleDateString("ru-RU", {
//             month: "long",
//             year: "numeric",
//           })}
//         </h2>
//         <button className="month-nav-btn" onClick={() => navigateMonth(1)}>
//           <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//             <path
//               d="M8 16L14 10L8 4"
//               stroke="currentColor"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Календарь */}
//       <div className="calendar">
//         <div className="calendar-weekdays">
//           {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
//             <div key={day} className="weekday">
//               {day}
//             </div>
//           ))}
//         </div>
//         <div className="calendar-grid">{renderCalendar()}</div>
//       </div>

//       {/* ============= МАССОВАЯ ПУБЛИКАЦИЯ ============= */}
//       {showBulkModal && (
//         <div className="modal-overlay">
//           <div className="modal bulk-modal">
//             <div className="modal-header">
//               <h3 className="modal-title">Список ожидания</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => {
//                   setShowBulkModal(false);
//                   setBulkForm({ selectedEvents: [], sendEmail: true });
//                 }}
//               >
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="modal-content">
//               {pendingEvents.length === 0 ? (
//                 <div className="empty-state">
//                   <svg
//                     width="48"
//                     height="48"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                   >
//                     <path
//                       d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
//                       strokeWidth="1.5"
//                     />
//                   </svg>
//                   <p>Нет смен для публикации</p>
//                   <span>Создайте смены в режиме массовой публикации</span>
//                 </div>
//               ) : (
//                 <>
//                   <div className="bulk-stats">
//                     <div className="stat-badge">
//                       Всего ожидает: <strong>{pendingEvents.length}</strong>
//                     </div>
//                     <div className="stat-badge">
//                       Выбрано: <strong>{bulkForm.selectedEvents.length}</strong>
//                     </div>
//                   </div>

//                   <div className="bulk-actions">
//                     <button
//                       className="btn-small"
//                       onClick={() =>
//                         setBulkForm({
//                           ...bulkForm,
//                           selectedEvents: pendingEvents.map((e) => e.id),
//                         })
//                       }
//                     >
//                       Выбрать все
//                     </button>
//                     <button
//                       className="btn-small"
//                       onClick={() =>
//                         setBulkForm({ ...bulkForm, selectedEvents: [] })
//                       }
//                     >
//                       Снять все
//                     </button>
//                   </div>

//                   <div className="pending-events-list">
//                     {pendingEvents.map((event) => {
//                       const user = users.find((u) => u.id === event.userId);
//                       if (!user) return null;

//                       const isSelected = bulkForm.selectedEvents.includes(
//                         event.id
//                       );

//                       return (
//                         <div
//                           key={event.id}
//                           className={`pending-event ${
//                             isSelected ? "selected" : ""
//                           }`}
//                           onClick={() => {
//                             setBulkForm((prev) => ({
//                               ...prev,
//                               selectedEvents: isSelected
//                                 ? prev.selectedEvents.filter(
//                                     (id) => id !== event.id
//                                   )
//                                 : [...prev.selectedEvents, event.id],
//                             }));
//                           }}
//                           style={{ "--user-color": user.color }}
//                         >
//                           <div className="pending-event-check">
//                             <div
//                               className={`checkbox ${
//                                 isSelected ? "checked" : ""
//                               }`}
//                             >
//                               {isSelected && "✓"}
//                             </div>
//                           </div>
//                           <div
//                             className="pending-event-color"
//                             style={{ backgroundColor: user.color }}
//                           />
//                           <div className="pending-event-info">
//                             <div className="pending-event-name">
//                               {user.name}
//                             </div>
//                             <div className="pending-event-title">
//                               {event.title}
//                             </div>
//                             <div className="pending-event-datetime">
//                               {event.date} · {event.startTime} — {event.endTime}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {isAuthorized && bulkForm.selectedEvents.length > 0 && (
//                     <div className="bulk-settings">
//                       <label className="checkbox-label">
//                         <input
//                           type="checkbox"
//                           checked={bulkForm.sendEmail}
//                           onChange={(e) =>
//                             setBulkForm({
//                               ...bulkForm,
//                               sendEmail: e.target.checked,
//                             })
//                           }
//                         />
//                         <span>Отправить приглашения на email</span>
//                       </label>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             <div className="modal-footer">
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => {
//                   setShowBulkModal(false);
//                   setBulkForm({ selectedEvents: [], sendEmail: true });
//                 }}
//               >
//                 Закрыть
//               </button>
//               {pendingEvents.length > 0 && (
//                 <button
//                   className="btn btn-primary"
//                   onClick={publishBulkEvents}
//                   disabled={
//                     bulkForm.selectedEvents.length === 0 ||
//                     bulkPublishing ||
//                     !isAuthorized
//                   }
//                 >
//                   {bulkPublishing ? (
//                     <>
//                       <span className="spinner-small" />
//                       Публикация...
//                     </>
//                   ) : (
//                     `Опубликовать (${bulkForm.selectedEvents.length})`
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ============= МОДАЛКА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ СМЕНЫ ============= */}
//       {showModal && (
//         <div className="modal-overlay">
//           <div className="modal shift-modal">
//             <div className="modal-header">
//               <h3 className="modal-title">
//                 {eventForm.id
//                   ? eventForm.isPending
//                     ? "Редактирование (ожидает публикации)"
//                     : "Редактирование смены"
//                   : "Новая смена"}
//               </h3>
//               <button
//                 className="modal-close"
//                 onClick={() => {
//                   setShowModal(false);
//                   setEventForm({
//                     id: null,
//                     title: "",
//                     date: formatDateToYMD(new Date()),
//                     startTime: "09:00",
//                     endTime: "18:00",
//                     userIds: [],
//                     sendEmail: true,
//                     isPending: false,
//                   });
//                 }}
//               >
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="modal-content">
//               <div className="form-section">
//                 <label className="form-label">Название смены</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   value={eventForm.title}
//                   onChange={(e) =>
//                     setEventForm({ ...eventForm, title: e.target.value })
//                   }
//                   placeholder="Например: Дневная смена"
//                 />
//               </div>

//               <div className="form-row">
//                 <div className="form-section">
//                   <label className="form-label">Дата</label>
//                   <input
//                     type="date"
//                     className="form-input"
//                     value={eventForm.date}
//                     onChange={(e) =>
//                       setEventForm({ ...eventForm, date: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div className="form-section">
//                   <label className="form-label">Время</label>
//                   <div className="time-inputs">
//                     <input
//                       type="time"
//                       className="form-input time"
//                       value={eventForm.startTime}
//                       onChange={(e) =>
//                         setEventForm({
//                           ...eventForm,
//                           startTime: e.target.value,
//                         })
//                       }
//                     />
//                     <span className="time-separator">—</span>
//                     <input
//                       type="time"
//                       className="form-input time"
//                       value={eventForm.endTime}
//                       onChange={(e) =>
//                         setEventForm({ ...eventForm, endTime: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="form-section">
//                 <label className="form-label">
//                   {eventForm.id
//                     ? "Сотрудник"
//                     : "Сотрудники (можно выбрать несколько)"}
//                 </label>
//                 {users.length === 0 ? (
//                   <div className="empty-users">
//                     <p>Нет добавленных сотрудников</p>
//                     <button
//                       className="btn btn-small"
//                       onClick={() => {
//                         setShowModal(false);
//                         setShowUserModal(true);
//                       }}
//                     >
//                       Добавить сотрудника
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="users-grid">
//                       {users.map((user) => {
//                         const isSelected = eventForm.userIds.includes(user.id);
//                         return (
//                           <div
//                             key={user.id}
//                             className={`user-card ${
//                               isSelected ? "selected" : ""
//                             }`}
//                             onClick={() => toggleUserSelection(user.id)}
//                             style={{ "--user-color": user.color }}
//                           >
//                             <div
//                               className="user-avatar"
//                               style={{ backgroundColor: user.color }}
//                             >
//                               {user.name.charAt(0)}
//                             </div>
//                             <span className="user-name">{user.name}</span>
//                             {isSelected && (
//                               <span className="user-check">✓</span>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                     {eventForm.userIds.length > 0 && (
//                       <div className="selected-users">
//                         <span className="selected-count">
//                           {eventForm.id ? "Сотрудник:" : "Выбрано:"}{" "}
//                           {eventForm.userIds.length}
//                         </span>
//                         <div className="selected-tags">
//                           {eventForm.userIds.map((userId) => {
//                             const user = users.find((u) => u.id === userId);
//                             return user ? (
//                               <span
//                                 key={userId}
//                                 className="selected-tag"
//                                 style={{
//                                   backgroundColor: `${user.color}20`,
//                                   borderColor: user.color,
//                                 }}
//                               >
//                                 <span
//                                   style={{ backgroundColor: user.color }}
//                                   className="tag-dot"
//                                 ></span>
//                                 {user.name}
//                               </span>
//                             ) : null;
//                           })}
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>

//               {/* Индикатор режима */}
//               {!eventForm.id && (
//                 <div className={`mode-badge ${bulkMode ? "bulk" : "direct"}`}>
//                   <span className="badge-icon">{bulkMode ? "📦" : "⚡"}</span>
//                   <span>
//                     {bulkMode
//                       ? "Смены будут добавлены в список ожидания (СЕРЫЕ)"
//                       : "Смены будут опубликованы в Google Calendar сразу (ЦВЕТНЫЕ)"}
//                   </span>
//                 </div>
//               )}

//               {eventForm.isPending && (
//                 <div className="mode-badge bulk">
//                   <span className="badge-icon">⏳</span>
//                   <span>Эта смена ожидает публикации (СЕРАЯ)</span>
//                 </div>
//               )}

//               {isAuthorized &&
//                 eventForm.userIds.length > 0 &&
//                 !eventForm.isPending && (
//                   <div className="form-section google-settings">
//                     <label className="checkbox-label">
//                       <input
//                         type="checkbox"
//                         checked={eventForm.sendEmail}
//                         onChange={(e) =>
//                           setEventForm({
//                             ...eventForm,
//                             sendEmail: e.target.checked,
//                           })
//                         }
//                       />
//                       <span>Отправить приглашения в Google Calendar</span>
//                     </label>
//                   </div>
//                 )}
//             </div>

//             <div className="modal-footer">
//               {eventForm.id && (
//                 <button
//                   className="btn btn-danger"
//                   onClick={() =>
//                     handleDeleteEvent(eventForm.id, eventForm.isPending)
//                   }
//                 >
//                   Удалить
//                 </button>
//               )}
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => {
//                   setShowModal(false);
//                   setEventForm({
//                     id: null,
//                     title: "",
//                     date: formatDateToYMD(new Date()),
//                     startTime: "09:00",
//                     endTime: "18:00",
//                     userIds: [],
//                     sendEmail: true,
//                     isPending: false,
//                   });
//                 }}
//               >
//                 Отмена
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={eventForm.id ? handleUpdateEvent : handleCreateEvent}
//                 disabled={
//                   eventForm.userIds.length === 0 || !eventForm.title.trim()
//                 }
//               >
//                 {eventForm.id ? "Сохранить" : "Создать смену"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Модалка статистики */}
//       {showStatsModal && (
//         <div className="modal-overlay">
//           <div className="modal stats-modal">
//             <div className="modal-header">
//               <h3 className="modal-title">Статистика</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => setShowStatsModal(false)}
//               >
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="stats-content">
//               {users.length === 0 ? (
//                 <div className="empty-state">
//                   <svg
//                     width="48"
//                     height="48"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                   >
//                     <path
//                       d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
//                       strokeWidth="1.5"
//                     />
//                   </svg>
//                   <p>Нет данных для статистики</p>
//                   <span>Добавьте сотрудников и смены</span>
//                 </div>
//               ) : (
//                 <>
//                   <div className="stats-overview">
//                     <div className="stat-card">
//                       <div className="stat-value">{users.length}</div>
//                       <div className="stat-label">Сотрудников</div>
//                     </div>
//                     <div className="stat-card">
//                       <div className="stat-value">
//                         {Object.keys(events).length}
//                       </div>
//                       <div className="stat-label">Опубликовано</div>
//                     </div>
//                     <div className="stat-card">
//                       <div className="stat-value">{pendingEvents.length}</div>
//                       <div className="stat-label">Ожидают</div>
//                     </div>
//                   </div>

//                   <div className="stats-employees">
//                     {Object.values(stats).map((userStat) => (
//                       <div
//                         key={userStat.user.id}
//                         className="employee-stat"
//                         style={{ "--user-color": userStat.user.color }}
//                       >
//                         <div className="employee-header">
//                           <div className="employee-info">
//                             <div
//                               className="employee-avatar"
//                               style={{ backgroundColor: userStat.user.color }}
//                             >
//                               {userStat.user.name.charAt(0)}
//                             </div>
//                             <div>
//                               <div className="employee-name">
//                                 {userStat.user.name}
//                               </div>
//                               <div className="employee-email">
//                                 {userStat.user.email}
//                               </div>
//                             </div>
//                           </div>
//                           <div className="employee-total">
//                             <div className="total-shifts">
//                               {userStat.totalShifts} смен
//                             </div>
//                             <div className="total-hours">
//                               {userStat.totalHours.toFixed(1)} ч
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Модалка управления сотрудниками */}
//       {showUserModal && (
//         <div className="modal-overlay">
//           <div className="modal users-modal">
//             <div className="modal-header">
//               <h3 className="modal-title">Сотрудники</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => setShowUserModal(false)}
//               >
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="users-content">
//               <div className="add-user-form">
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="Имя и фамилия"
//                   value={newUser.name}
//                   onChange={(e) =>
//                     setNewUser({ ...newUser, name: e.target.value })
//                   }
//                 />
//                 <input
//                   type="email"
//                   className="form-input"
//                   placeholder="Email"
//                   value={newUser.email}
//                   onChange={(e) =>
//                     setNewUser({ ...newUser, email: e.target.value })
//                   }
//                 />
//                 <select
//                   className="form-select"
//                   value={newUser.color}
//                   onChange={(e) =>
//                     setNewUser({ ...newUser, color: e.target.value })
//                   }
//                 >
//                   {GOOGLE_COLORS.map((color) => (
//                     <option key={color.hex} value={color.hex}>
//                       {color.name}
//                     </option>
//                   ))}
//                 </select>
//                 <div
//                   className="color-preview"
//                   style={{ backgroundColor: newUser.color }}
//                 />
//                 <button
//                   className="btn btn-primary add-user-btn"
//                   onClick={handleAddUser}
//                   disabled={!newUser.name.trim() || !newUser.email.trim()}
//                 >
//                   Добавить
//                 </button>
//               </div>

//               <div className="users-list">
//                 {users.length === 0 ? (
//                   <div className="empty-state">
//                     <svg
//                       width="48"
//                       height="48"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                     >
//                       <path d="M12 4V20M4 12H20" strokeWidth="1.5" />
//                     </svg>
//                     <p>Нет сотрудников</p>
//                     <span>Добавьте первого сотрудника</span>
//                   </div>
//                 ) : (
//                   users.map((user) => (
//                     <div
//                       key={user.id}
//                       className="user-list-item"
//                       style={{ "--user-color": user.color }}
//                     >
//                       <div
//                         className="user-avatar-large"
//                         style={{ backgroundColor: user.color }}
//                       >
//                         {user.name.charAt(0)}
//                       </div>
//                       <div className="user-details">
//                         <div className="user-name-large">{user.name}</div>
//                         <div className="user-email-small">{user.email}</div>
//                         <div className="user-color-name">
//                           {GOOGLE_COLORS.find((c) => c.hex === user.color)
//                             ?.name || "Цвет"}
//                         </div>
//                       </div>
//                       <button
//                         className="btn-icon-small"
//                         onClick={() => handleDeleteUser(user.id)}
//                       >
//                         <svg
//                           width="16"
//                           height="16"
//                           viewBox="0 0 16 16"
//                           fill="none"
//                         >
//                           <path
//                             d="M2 4H14M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M12 6V14C12 14.5523 11.5523 15 11 15H5C4.44772 15 4 14.5523 4 14V6"
//                             stroke="currentColor"
//                             strokeWidth="1.2"
//                             strokeLinecap="round"
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         .app-container {
//           max-width: 1440px;
//           margin: 0 auto;
//           padding: 24px;
//           font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI",
//             Roboto, sans-serif;
//           color: #1a1a1a;
//         }

//         .app-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 24px;
//         }

//         .app-title {
//           font-size: 24px;
//           font-weight: 600;
//           margin: 0;
//           color: #1a1a1a;
//         }

//         .header-left {
//           display: flex;
//           align-items: center;
//           gap: 24px;
//         }

//         .btn-google {
//           padding: 8px 16px;
//           background: #f8f9fa;
//           border: 1px solid #e0e0e0;
//           border-radius: 20px;
//           font-size: 14px;
//           color: #5f6368;
//           cursor: pointer;
//         }

//         .status-connected {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 6px 12px;
//           background: #f0f9f0;
//           border-radius: 20px;
//           font-size: 14px;
//           color: #1e7e34;
//         }

//         .status-dot {
//           width: 8px;
//           height: 8px;
//           background: #34a853;
//           border-radius: 50%;
//         }

//         .header-actions {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .bulk-mode-toggle {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 4px 12px;
//           background: #f8f9fa;
//           border-radius: 32px;
//           border: 1px solid #e0e0e0;
//         }

//         .toggle-label {
//           font-size: 14px;
//           color: #5f6368;
//         }

//         .toggle-switch {
//           position: relative;
//           width: 48px;
//           height: 24px;
//           background: #e0e0e0;
//           border-radius: 24px;
//           border: none;
//           cursor: pointer;
//           transition: all 0.3s;
//           padding: 0;
//         }

//         .toggle-switch.active {
//           background: #1a73e8;
//         }

//         .toggle-handle {
//           position: absolute;
//           top: 2px;
//           left: 2px;
//           width: 20px;
//           height: 20px;
//           background: white;
//           border-radius: 50%;
//           transition: all 0.3s;
//         }

//         .toggle-switch.active .toggle-handle {
//           left: 26px;
//         }

//         .btn-icon {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 16px;
//           background: white;
//           border: 1px solid #e0e0e0;
//           border-radius: 8px;
//           font-size: 14px;
//           color: #5f6368;
//           cursor: pointer;
//           position: relative;
//         }

//         .btn-icon.has-badge {
//           position: relative;
//         }

//         .btn-icon-badge {
//           position: absolute;
//           top: -6px;
//           right: -6px;
//           background: #dc3545;
//           color: white;
//           font-size: 11px;
//           font-weight: 600;
//           min-width: 20px;
//           height: 20px;
//           border-radius: 10px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 0 6px;
//         }

//         .mode-indicator {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 16px 20px;
//           border-radius: 12px;
//           margin-bottom: 24px;
//         }

//         .mode-indicator.normal-mode {
//           background: #f0f7ff;
//           border: 1px solid #1a73e8;
//         }

//         .mode-indicator.bulk-mode {
//           background: #f3e8ff;
//           border: 1px solid #9c27b0;
//         }

//         .mode-icon {
//           font-size: 24px;
//         }

//         .mode-text {
//           display: flex;
//           flex-direction: column;
//         }

//         .mode-text strong {
//           font-size: 15px;
//           margin-bottom: 4px;
//         }

//         .mode-text span {
//           font-size: 13px;
//           color: #5f6368;
//         }

//         .month-nav {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 24px;
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
//         }

//         .month-nav-btn {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 40px;
//           height: 40px;
//           border: none;
//           background: transparent;
//           color: #5f6368;
//           cursor: pointer;
//           border-radius: 8px;
//         }

//         .month-title {
//           font-size: 18px;
//           font-weight: 500;
//           margin: 0;
//           color: #1a1a1a;
//         }

//         .calendar {
//           background: white;
//           border-radius: 16px;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
//           padding: 20px;
//         }

//         .calendar-weekdays {
//           display: grid;
//           grid-template-columns: repeat(7, 1fr);
//           margin-bottom: 12px;
//         }

//         .weekday {
//           text-align: center;
//           font-size: 14px;
//           font-weight: 500;
//           color: #9aa0a6;
//           padding: 12px 0;
//         }

//         .calendar-grid {
//           display: grid;
//           grid-template-columns: repeat(7, 1fr);
//           gap: 4px;
//         }

//         .calendar-day {
//           position: relative;
//           min-height: 140px;
//           padding: 12px;
//           background: white;
//           border: 1px solid #f0f0f0;
//           border-radius: 8px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .calendar-day:hover {
//           background: #fafafa;
//           border-color: #e0e0e0;
//         }

//         .calendar-day.empty {
//           background: #f9f9f9;
//           border-color: transparent;
//           cursor: default;
//         }

//         .calendar-day.today {
//           background: #fff8e7;
//           border-color: #ffc107;
//         }

//         .calendar-day.selected {
//           border: 2px solid #1a73e8;
//           background: #f0f7ff;
//         }

//         .day-number {
//           font-size: 14px;
//           font-weight: 500;
//           color: #3c4043;
//           margin-bottom: 8px;
//         }

//         /* ============= КВАДРАТ СМЕНЫ ============= */
//         .shift-square {
//           display: flex;
//           flex-direction: column;
//           gap: 4px;
//           margin-top: 8px;
//         }

//         .shift-item {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 6px 10px;
//           border-radius: 6px;
//           color: white;
//           font-size: 12px;
//           font-weight: 500;
//           height: 28px;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           cursor: pointer;
//           transition: all 0.2s;
//           position: relative;
//         }

//         .shift-item:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
//         }

//         .shift-item.pending {
//           opacity: 0.55; /* СЕРЫЕ - ожидают публикации */
//           border-left: 3px solid rgba(0, 0, 0, 0.2);
//         }

//         .shift-initial {
//           background: rgba(255, 255, 255, 0.25);
//           width: 20px;
//           height: 20px;
//           border-radius: 4px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 600;
//         }

//         .shift-time {
//           opacity: 0.95;
//           font-weight: 600;
//         }

//         .shift-pending-badge {
//           margin-left: 4px;
//           font-size: 12px;
//         }

//         .shift-more {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 6px;
//           background: #f0f0f0;
//           border-radius: 6px;
//           font-size: 11px;
//           color: #5f6368;
//           font-weight: 500;
//         }

//         .pending-indicator {
//           position: absolute;
//           bottom: 8px;
//           right: 8px;
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           background: rgba(0, 0, 0, 0.6);
//           color: white;
//           padding: 4px 8px;
//           border-radius: 12px;
//           font-size: 10px;
//         }

//         .pending-dot {
//           width: 6px;
//           height: 6px;
//           background: #ffc107;
//           border-radius: 50%;
//         }

//         .pending-count {
//           font-weight: 500;
//         }

//         /* Модальные окна */
//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.4);
//           backdrop-filter: blur(4px);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 1000;
//           animation: fadeIn 0.2s;
//         }

//         .modal {
//           background: white;
//           border-radius: 16px;
//           width: 550px;
//           max-width: calc(100vw - 48px);
//           max-height: calc(100vh - 48px);
//           overflow: hidden;
//           box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
//           display: flex;
//           flex-direction: column;
//         }

//         .modal-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 20px 24px;
//           border-bottom: 1px solid #f0f0f0;
//         }

//         .modal-title {
//           margin: 0;
//           font-size: 18px;
//           font-weight: 600;
//           color: #1a1a1a;
//         }

//         .modal-close {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 32px;
//           height: 32px;
//           border: none;
//           background: transparent;
//           border-radius: 6px;
//           color: #5f6368;
//           cursor: pointer;
//         }

//         .modal-content {
//           padding: 24px;
//           overflow-y: auto;
//         }

//         .modal-footer {
//           display: flex;
//           justify-content: flex-end;
//           gap: 12px;
//           padding: 20px 24px;
//           border-top: 1px solid #f0f0f0;
//         }

//         /* Формы */
//         .form-section {
//           margin-bottom: 24px;
//         }

//         .form-label {
//           display: block;
//           margin-bottom: 8px;
//           font-size: 13px;
//           font-weight: 500;
//           color: #5f6368;
//         }

//         .form-input {
//           width: 100%;
//           padding: 10px 12px;
//           border: 1px solid #e0e0e0;
//           border-radius: 8px;
//           font-size: 14px;
//           box-sizing: border-box;
//         }

//         .form-row {
//           display: grid;
//           grid-template-columns: 1fr 1.5fr;
//           gap: 16px;
//         }

//         .time-inputs {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .time-inputs .time {
//           width: 120px;
//         }

//         .time-separator {
//           color: #5f6368;
//         }

//         /* Карточки сотрудников - для множественного выбора */
//         .users-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
//           gap: 8px;
//           margin-bottom: 12px;
//         }

//         .user-card {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 12px;
//           background: #f8f9fa;
//           border: 1px solid #e0e0e0;
//           border-radius: 8px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .user-card.selected {
//           background: var(--user-color, #f0f7ff);
//           border-color: var(--user-color, #1a73e8);
//           box-shadow: 0 2px 8px rgba(var(--user-color-rgb), 0.2);
//         }

//         .user-avatar {
//           width: 28px;
//           height: 28px;
//           border-radius: 6px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 14px;
//           font-weight: 600;
//         }

//         .user-name {
//           font-size: 13px;
//           font-weight: 500;
//           color: #1a1a1a;
//           flex: 1;
//         }

//         .user-check {
//           color: #1a73e8;
//           font-size: 14px;
//           font-weight: 600;
//         }

//         .selected-users {
//           padding: 12px;
//           background: #f8f9fa;
//           border-radius: 8px;
//         }

//         .selected-count {
//           font-weight: 600;
//           color: #1a73e8;
//           display: block;
//           margin-bottom: 8px;
//         }

//         .selected-tags {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 6px;
//         }

//         .selected-tag {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 4px 10px;
//           background: white;
//           border: 1px solid;
//           border-radius: 16px;
//           font-size: 12px;
//         }

//         .tag-dot {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//         }

//         .mode-badge {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 12px 16px;
//           border-radius: 8px;
//           margin-bottom: 20px;
//         }

//         .mode-badge.bulk {
//           background: #f3e8ff;
//           border: 1px solid #9c27b0;
//           color: #6a1b9a;
//         }

//         .mode-badge.direct {
//           background: #f0f7ff;
//           border: 1px solid #1a73e8;
//           color: #0d47a1;
//         }

//         .badge-icon {
//           font-size: 16px;
//         }

//         /* Список ожидания */
//         .pending-events-list {
//           display: grid;
//           gap: 8px;
//           max-height: 360px;
//           overflow-y: auto;
//           padding: 4px;
//           margin-bottom: 20px;
//         }

//         .pending-event {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 12px 16px;
//           background: white;
//           border: 1px solid #e0e0e0;
//           border-radius: 10px;
//           cursor: pointer;
//           transition: all 0.2s;
//           opacity: 0.8;
//         }

//         .pending-event.selected {
//           opacity: 1;
//           border-color: var(--user-color, #1a73e8);
//           background: linear-gradient(
//             135deg,
//             rgba(var(--user-color-rgb), 0.08) 0%,
//             white 100%
//           );
//         }

//         .pending-event-color {
//           width: 4px;
//           height: 40px;
//           border-radius: 2px;
//         }

//         .btn {
//           padding: 10px 20px;
//           border: none;
//           border-radius: 8px;
//           font-size: 14px;
//           font-weight: 500;
//           cursor: pointer;
//         }

//         .btn-primary {
//           background: #1a73e8;
//           color: white;
//         }

//         .btn-secondary {
//           background: white;
//           border: 1px solid #e0e0e0;
//           color: #5f6368;
//         }

//         .btn-danger {
//           background: #dc3545;
//           color: white;
//         }

//         .btn-small {
//           padding: 6px 12px;
//           font-size: 13px;
//           background: #f8f9fa;
//           border: 1px solid #e0e0e0;
//           border-radius: 6px;
//           color: #5f6368;
//           cursor: pointer;
//         }

//         .btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .loading-screen {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: 100vh;
//           background: white;
//         }

//         .loading-spinner {
//           width: 48px;
//           height: 48px;
//           border: 3px solid #f0f0f0;
//           border-radius: 50%;
//           border-top-color: #1a73e8;
//           animation: spin 0.8s linear infinite;
//           margin-bottom: 16px;
//         }

//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         .loading-text {
//           font-size: 16px;
//           color: #5f6368;
//         }

//         .bulk-stats {
//           display: flex;
//           gap: 12px;
//           margin-bottom: 20px;
//         }

//         .stat-badge {
//           padding: 8px 16px;
//           background: #f8f9fa;
//           border-radius: 20px;
//           font-size: 14px;
//         }

//         .checkbox-label {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           font-size: 14px;
//           cursor: pointer;
//         }

//         .checkbox {
//           width: 20px;
//           height: 20px;
//           border: 2px solid #e0e0e0;
//           border-radius: 6px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 14px;
//         }

//         .checkbox.checked {
//           background: var(--user-color, #1a73e8);
//           border-color: var(--user-color, #1a73e8);
//           color: white;
//         }

//         .add-user-form {
//           display: grid;
//           grid-template-columns: 1fr 1fr auto auto;
//           gap: 12px;
//           margin-bottom: 24px;
//           padding: 20px;
//           background: #f8f9fa;
//           border-radius: 12px;
//           align-items: end;
//         }

//         .form-select {
//           padding: 10px 12px;
//           border: 1px solid #e0e0e0;
//           border-radius: 8px;
//           font-size: 14px;
//         }

//         .color-preview {
//           width: 40px;
//           height: 40px;
//           border-radius: 8px;
//           border: 2px solid white;
//           box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
//         }

//         .users-list {
//           display: grid;
//           gap: 8px;
//         }

//         .user-list-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 12px;
//           background: white;
//           border: 1px solid #e0e0e0;
//           border-radius: 10px;
//         }

//         .user-avatar-large {
//           width: 48px;
//           height: 48px;
//           border-radius: 12px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 20px;
//           font-weight: 600;
//         }

//         .user-details {
//           flex: 1;
//         }

//         .user-name-large {
//           font-size: 16px;
//           font-weight: 600;
//           color: #1a1a1a;
//           margin-bottom: 4px;
//         }

//         .user-email-small {
//           font-size: 13px;
//           color: #5f6368;
//           margin-bottom: 2px;
//         }

//         .user-color-name {
//           font-size: 12px;
//           color: #9aa0a6;
//         }

//         .btn-icon-small {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 32px;
//           height: 32px;
//           border: none;
//           background: transparent;
//           border-radius: 6px;
//           color: #5f6368;
//           cursor: pointer;
//         }

//         .btn-icon-small:hover {
//           background: #fee9e7;
//           color: #dc3545;
//         }

//         .stats-content {
//           padding: 24px;
//           overflow-y: auto;
//         }

//         .stats-overview {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 16px;
//           margin-bottom: 32px;
//         }

//         .stat-card {
//           padding: 20px;
//           background: #f8f9fa;
//           border-radius: 12px;
//           text-align: center;
//         }

//         .stat-value {
//           font-size: 28px;
//           font-weight: 600;
//           color: #1a73e8;
//           margin-bottom: 4px;
//         }

//         .stat-label {
//           font-size: 13px;
//           color: #5f6368;
//         }

//         .stats-employees {
//           display: grid;
//           gap: 16px;
//         }

//         .employee-stat {
//           padding: 20px;
//           background: #f8f9fa;
//           border-radius: 12px;
//           border-left: 4px solid var(--user-color, #1a73e8);
//         }

//         .employee-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//         }

//         .employee-info {
//           display: flex;
//           gap: 12px;
//         }

//         .employee-avatar {
//           width: 40px;
//           height: 40px;
//           border-radius: 10px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 18px;
//           font-weight: 600;
//         }

//         .employee-name {
//           font-size: 16px;
//           font-weight: 600;
//           color: #1a1a1a;
//           margin-bottom: 4px;
//         }

//         .employee-email {
//           font-size: 13px;
//           color: #5f6368;
//         }

//         .employee-total {
//           text-align: right;
//         }

//         .total-shifts {
//           font-size: 13px;
//           color: #5f6368;
//           margin-bottom: 4px;
//         }

//         .total-hours {
//           font-size: 18px;
//           font-weight: 600;
//           color: #1a73e8;
//         }

//         .empty-state {
//           text-align: center;
//           padding: 48px 24px;
//           background: #f8f9fa;
//           border-radius: 12px;
//           color: #5f6368;
//         }

//         .empty-state p {
//           margin: 0 0 8px 0;
//           font-size: 16px;
//           font-weight: 500;
//           color: #1a1a1a;
//         }

//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @media (max-width: 768px) {
//           .app-container {
//             padding: 16px;
//           }

//           .app-header {
//             flex-direction: column;
//             align-items: stretch;
//             gap: 16px;
//           }

//           .header-actions {
//             flex-wrap: wrap;
//           }

//           .calendar-day {
//             min-height: 120px;
//           }

//           .form-row {
//             grid-template-columns: 1fr;
//           }

//           .add-user-form {
//             grid-template-columns: 1fr;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import "./App.css";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyCSnUlsCQIXk0XiLmua1dNiVj-Vag3hxc0",
  authDomain: "baza-ee8e7.firebaseapp.com",
  databaseURL:
    "https://baza-ee8e7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "baza-ee8e7",
  storageBucket: "baza-ee8e7.firebasestorage.app",
  messagingSenderId: "656749534532",
  appId: "1:656749534532:web:c24eb1712b7b2944614b11",
  measurementId: "G-HMTKWG50QW",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const CLIENT_ID =
  "1068282317957-eulj4v3sm03pcl2vu5ub9cfu1shard5p.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// Цвета Google Calendar
const GOOGLE_COLORS = [
  { id: 1, name: "Lawendowy", hex: "#7986cb" },
  { id: 2, name: "Zielony", hex: "#33b679" },
  { id: 3, name: "Fioletowy", hex: "#8e24aa" },
  { id: 4, name: "Koralowy", hex: "#e67c73" },
  { id: 5, name: "Żółty", hex: "#f6bf26" },
  { id: 6, name: "Pomarańczowy", hex: "#f4511e" },
  { id: 7, name: "Niebieski", hex: "#039be5" },
  { id: 8, name: "Limonkowy", hex: "#c0ca33" },
  { id: 9, name: "Szary", hex: "#616161" },
  { id: 10, name: "Indygo", hex: "#3f51b5" },
  { id: 11, name: "Ciemnozielony", hex: "#0b8043" },
];

const USER_COLORS = GOOGLE_COLORS.map((c) => c.hex);
const COLOR_MAPPING = {};
GOOGLE_COLORS.forEach((color) => {
  COLOR_MAPPING[color.hex] = color.id;
});

const formatDateToYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ============= КОМПОНЕНТ ВХОДА =============
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Специальная проверка для админа
      if (email !== "jetzone24admin@gmail.com") {
        throw new Error("Доступ разрешён только администратору");
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      onLogin(userCredential.user);
    } catch (error) {
      console.error("Ошибка входа:", error);

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Неверный email или пароль");
      } else if (error.code === "auth/invalid-email") {
        setError("Неверный формат email");
      } else if (error.code === "auth/too-many-requests") {
        setError("Слишком много попыток. Попробуйте позже");
      } else {
        setError(error.message || "Ошибка входа. Проверьте данные");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">JetZone24</div>
          <h1 className="login-title">Kalendarz zmian</h1>
          <p className="login-subtitle">Logowanie do panelu administratora</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <i class="fa-regular fa-envelope"></i>
              </span>
              <input
                type="email"
                className="login-input"
                placeholder="JetZone24"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Hasło</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <i class="fa-solid fa-shield-halved"></i>
              </span>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span className="login-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner" />
                Logowanie...
              </>
            ) : (
              "Zalogować się"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Tylko dla administratorów</p>
          <p className="login-hint">Użyj firmowych danych logowania</p>
        </div>
      </div>
    </div>
  );
};

// ============= КОМПОНЕНТ ВЫХОДА =============
const LogoutButton = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  return (
    <button className="btn-icon logout-btn" onClick={handleLogout}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M7 4H5C3.89543 4 3 4.89543 3 6V14C3 15.1046 3.89543 16 5 16H7M13 12L16 10M16 10L13 8M16 10H8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span>Wyloguj się</span>
    </button>
  );
};

const calculateHoursDiff = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  let diff = endTotal - startTotal;
  if (diff < 0) diff += 24 * 60;
  return diff / 60;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [authWindow, setAuthWindow] = useState(null);
  const [bulkPublishing, setBulkPublishing] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  // Форма создания/редактирования смены
  const [eventForm, setEventForm] = useState({
    id: null,
    title: "",
    date: formatDateToYMD(new Date()),
    startTime: "13:00",
    endTime: "20:00",
    userIds: [],
    sendEmail: true,
    isPending: false,
  });

  const [bulkForm, setBulkForm] = useState({
    selectedEvents: [],
    sendEmail: true,
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    color: USER_COLORS[0],
  });

  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // ============= АВТОРИЗАЦИЯ =============
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Инициализация данных после авторизации
  useEffect(() => {
    if (user) {
      loadInitialData();

      const token = localStorage.getItem("google_token");
      if (token) {
        setIsAuthorized(true);
        verifyToken(token);
      }

      window.addEventListener("message", handleAuthMessage);
      return () => {
        window.removeEventListener("message", handleAuthMessage);
        if (authWindow) authWindow.close();
      };
    }
  }, [user]);

  // Статистика
  useEffect(() => {
    if (user) {
      calculateStatistics();
    }
  }, [events, users, user]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token=")) {
      const token = hash.split("access_token=")[1].split("&")[0];
      localStorage.setItem("google_token", token);
      setIsAuthorized(true);
      window.location.hash = "";
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);

  const calculateStatistics = () => {
    const newStats = {};
    users.forEach((user) => {
      const userEvents = Object.values(events).filter(
        (e) => e.userId === user.id
      );
      const totalShifts = userEvents.length;
      let totalHours = 0;
      userEvents.forEach((event) => {
        totalHours += calculateHoursDiff(event.startTime, event.endTime);
      });
      newStats[user.id] = {
        user,
        totalShifts,
        totalHours: parseFloat(totalHours.toFixed(1)),
        averageHoursPerShift:
          totalShifts > 0
            ? parseFloat((totalHours / totalShifts).toFixed(1))
            : 0,
      };
    });
    setStats(newStats);
  };

  const handleAuthMessage = (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data.type === "google_auth_success") {
      const token = event.data.token;
      localStorage.setItem("google_token", token);
      setIsAuthorized(true);
      if (authWindow) {
        authWindow.close();
        setAuthWindow(null);
      }
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + token
      );
      const data = await response.json();
      if (data.error) {
        localStorage.removeItem("google_token");
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Ошибка проверки токена:", error);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    await loadUsersFromFirebase();
    await loadEventsFromFirebase();
    const savedPending = localStorage.getItem("pendingEvents");
    if (savedPending) {
      try {
        setPendingEvents(JSON.parse(savedPending));
      } catch (e) {
        setPendingEvents([]);
      }
    }
    setIsLoading(false);
  };

  const loadUsersFromFirebase = () => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersMap = new Map();
        Object.values(data).forEach((user) => {
          if (user && user.id) {
            usersMap.set(user.id, user);
          }
        });
        const uniqueUsers = Array.from(usersMap.values());
        setUsers(uniqueUsers);
      } else {
        setUsers([]);
      }
    });
  };

  const loadEventsFromFirebase = () => {
    const eventsRef = ref(db, "calendarEvents");
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEvents(data);
      } else {
        setEvents({});
      }
    });
  };

  const savePendingEvents = (newPendingEvents) => {
    setPendingEvents(newPendingEvents);
    localStorage.setItem("pendingEvents", JSON.stringify(newPendingEvents));
  };

  const loginWithGoogle = () => {
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent(SCOPES);
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const win = window.open(
      authUrl,
      "Google Auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );
    setAuthWindow(win);
  };

  const logout = () => {
    localStorage.removeItem("google_token");
    setIsAuthorized(false);
  };

  const saveEventToFirebase = async (eventData, eventId = null) => {
    const id = eventId || Date.now().toString();
    const eventRef = ref(db, `calendarEvents/${id}`);
    await set(eventRef, { ...eventData, id });
    return id;
  };

  const deleteEventFromFirebase = async (eventId) => {
    const eventRef = ref(db, `calendarEvents/${eventId}`);
    await remove(eventRef);
  };

  const getGoogleCalendarColor = (userColor) => {
    return COLOR_MAPPING[userColor] || 1;
  };

  const createGoogleCalendarEvent = async (eventData, user) => {
    const token = localStorage.getItem("google_token");
    if (!token) return null;

    const [year, month, day] = eventData.date.split("-").map(Number);
    const [startHour, startMinute] = eventData.startTime.split(":").map(Number);
    const [endHour, endMinute] = eventData.endTime.split(":").map(Number);

    const startDateTime = new Date(
      year,
      month - 1,
      day,
      startHour,
      startMinute
    );
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

    const event = {
      summary: `${user.name} — ${eventData.title || "Смена"}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      description: `Сотрудник: ${user.name}\nEmail: ${user.email}\nСмена: ${
        eventData.title || "Рабочая смена"
      }`,
      colorId: getGoogleCalendarColor(user.color).toString(),
    };

    if (user?.email && eventData.sendEmail) {
      event.attendees = [
        {
          email: user.email,
          displayName: user.name,
          responseStatus: "needsAction",
        },
      ];
    }

    try {
      const queryParams = new URLSearchParams();
      if (eventData.sendEmail && user?.email) {
        queryParams.append("sendUpdates", "all");
      }
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("google_token");
          setIsAuthorized(false);
        }
        return null;
      }
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Ошибка создания события в Google Calendar:", error);
      return null;
    }
  };

  const publishBulkEvents = async () => {
    if (bulkForm.selectedEvents.length === 0) {
      alert("Выберите события для публикации");
      return;
    }

    if (!isAuthorized) {
      alert("Для публикации нужно войти в Google Calendar");
      return;
    }

    setBulkPublishing(true);

    const publishedEvents = [];
    let successCount = 0;
    let failCount = 0;

    for (const eventId of bulkForm.selectedEvents) {
      const event = pendingEvents.find((e) => e.id === eventId);
      if (!event) continue;

      const user = users.find((u) => u.id === event.userId);
      if (!user) continue;

      const googleEventId = await createGoogleCalendarEvent(event, user);

      if (googleEventId) {
        const savedEventId = await saveEventToFirebase({
          ...event,
          googleEventId,
          createdAt: new Date().toISOString(),
          isPending: false,
        });
        publishedEvents.push({ ...event, googleEventId, id: savedEventId });
        successCount++;
      } else {
        failCount++;
      }
    }

    if (publishedEvents.length > 0) {
      setEvents((prev) => {
        const newEvents = { ...prev };
        publishedEvents.forEach((event) => {
          newEvents[event.id] = event;
        });
        return newEvents;
      });
    }

    const newPendingEvents = pendingEvents.filter(
      (e) => !bulkForm.selectedEvents.includes(e.id)
    );
    savePendingEvents(newPendingEvents);

    setBulkForm({ selectedEvents: [], sendEmail: true });
    setBulkPublishing(false);
    setShowBulkModal(false);

    //     alert(`✅ Opublikowano: ${successCount}\n❌ Błędów: ${failCount}
    // `);
  };

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title.trim()) {
      alert("Введите название смены");
      return;
    }

    if (eventForm.userIds.length === 0) {
      alert("Выберите хотя бы одного сотрудника");
      return;
    }

    if (bulkMode) {
      const newPendingEvents = eventForm.userIds.map((userId) => {
        const user = users.find((u) => u.id === userId);
        return {
          ...eventForm,
          userId,
          id: `pending_${Date.now()}_${userId}_${Math.random()
            .toString(36)
            .substr(2, 6)}`,
          createdAt: new Date().toISOString(),
          isPending: true,
          user,
        };
      });

      savePendingEvents([...pendingEvents, ...newPendingEvents]);
      // alert(`✅ Добавлено ${newPendingEvents.length} смен в список ожидания`);
    } else {
      const createdEvents = [];
      let successCount = 0;

      for (const userId of eventForm.userIds) {
        const user = users.find((u) => u.id === userId);
        if (!user) continue;

        let googleEventId = null;
        if (isAuthorized) {
          googleEventId = await createGoogleCalendarEvent(eventForm, user);
        }

        const newEvent = {
          ...eventForm,
          userId,
          googleEventId,
          createdAt: new Date().toISOString(),
          isPending: false,
        };

        const savedEventId = await saveEventToFirebase(newEvent);
        newEvent.id = savedEventId;

        createdEvents.push(newEvent);
        successCount++;
      }

      setEvents((prev) => {
        const newEvents = { ...prev };
        createdEvents.forEach((event) => {
          newEvents[event.id] = event;
        });
        return newEvents;
      });

      // alert(`✅ Создано ${successCount} смен`);
    }

    setShowModal(false);
    setEventForm({
      id: null,
      title: "",
      date: formatDateToYMD(new Date()),
      startTime: "13:00",
      endTime: "20:00",
      userIds: [],
      sendEmail: true,
      isPending: false,
    });
  };

  const handleEditEvent = (event, isPending = false) => {
    setEventForm({
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      userIds: [event.userId],
      sendEmail: event.sendEmail !== undefined ? event.sendEmail : true,
      isPending: isPending,
    });
    setShowModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!eventForm.id) return;

    if (!eventForm.title.trim()) {
      alert("Введите название смены");
      return;
    }

    if (eventForm.userIds.length === 0) {
      alert("Выберите сотрудника");
      return;
    }

    const userId = eventForm.userIds[0];
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updatedEvent = {
      ...eventForm,
      userId,
      updatedAt: new Date().toISOString(),
    };

    if (eventForm.isPending) {
      const updatedPendingEvents = pendingEvents.map((e) =>
        e.id === eventForm.id ? { ...e, ...updatedEvent, user } : e
      );
      savePendingEvents(updatedPendingEvents);
      alert(`✅ Zmiana została zaktualizowana na liście oczekujących`);
    } else {
      if (isAuthorized && events[eventForm.id]?.googleEventId) {
        await deleteGoogleCalendarEvent(events[eventForm.id].googleEventId);
      }

      let googleEventId = null;
      if (isAuthorized) {
        googleEventId = await createGoogleCalendarEvent(eventForm, user);
      }

      updatedEvent.googleEventId =
        googleEventId || events[eventForm.id]?.googleEventId;

      await saveEventToFirebase(updatedEvent, eventForm.id);

      setEvents((prev) => ({
        ...prev,
        [eventForm.id]: updatedEvent,
      }));

      alert(`✅ Zmiana została zaktualizowana`);
    }

    setShowModal(false);
    setEventForm({
      id: null,
      title: "",
      date: formatDateToYMD(new Date()),
      startTime: "13:00",
      endTime: "20:00",
      userIds: [],
      sendEmail: true,
      isPending: false,
    });
  };

  const deleteGoogleCalendarEvent = async (googleEventId) => {
    const token = localStorage.getItem("google_token");
    if (!token) return;
    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}?sendUpdates=all`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Ошибка удаления события из Google Calendar:", error);
    }
  };

  const handleDeleteEvent = async (eventId, isPending = false) => {
    if (!window.confirm("Usunąć tę zmianę?")) return;

    if (isPending) {
      const newPendingEvents = pendingEvents.filter((e) => e.id !== eventId);
      savePendingEvents(newPendingEvents);
    } else {
      const event = events[eventId];
      if (isAuthorized && event?.googleEventId) {
        await deleteGoogleCalendarEvent(event.googleEventId);
      }
      await deleteEventFromFirebase(eventId);

      setEvents((prev) => {
        const newEvents = { ...prev };
        delete newEvents[eventId];
        return newEvents;
      });
    }

    if (eventForm.id === eventId) {
      setShowModal(false);
      setEventForm({
        id: null,
        title: "",
        date: formatDateToYMD(new Date()),
        startTime: "13:00",
        endTime: "20:00",
        userIds: [],
        sendEmail: true,
        isPending: false,
      });
    }
  };

  const handleDateClick = (date) => {
    const dateStr = formatDateToYMD(date);
    setSelectedDate(dateStr);

    const publishedEventsOnDate = Object.values(events).filter(
      (e) => e.date === dateStr
    );
    const pendingEventsOnDate = pendingEvents.filter((e) => e.date === dateStr);

    const allEventsOnDate = [
      ...publishedEventsOnDate.map((e) => ({ ...e, isPending: false })),
      ...pendingEventsOnDate.map((e) => ({ ...e, isPending: true })),
    ];

    if (allEventsOnDate.length === 0) {
      setEventForm({
        id: null,
        title: "",
        date: dateStr,
        startTime: "13:00",
        endTime: "20:00",
        userIds: [],
        sendEmail: true,
        isPending: false,
      });
      setShowModal(true);
    } else {
      const firstEvent = allEventsOnDate[0];
      handleEditEvent(firstEvent, firstEvent.isPending);
    }
  };

  const handleShiftClick = (e, event, isPending) => {
    e.stopPropagation();
    handleEditEvent(event, isPending);
  };

  const toggleUserSelection = (userId) => {
    setEventForm((prev) => {
      if (prev.id) {
        return { ...prev, userIds: [userId] };
      }
      const newUserIds = prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId];
      return { ...prev, userIds: newUserIds };
    });
  };

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert("Заполните имя и email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert("Введите корректный email");
      return;
    }

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
    );
    if (existingUser) {
      alert(`Пользователь с email ${newUser.email} уже существует`);
      return;
    }

    const newUserId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const userToAdd = {
      ...newUser,
      id: newUserId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const userRef = ref(db, `users/${newUserId}`);
    await set(userRef, userToAdd);

    setNewUser({ name: "", email: "", color: USER_COLORS[0] });
    // setShowUserModal(false);

    // alert(`✅ Сотрудник "${userToAdd.name}" добавлен`);
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (
      window.confirm(
        `Удалить сотрудника "${user.name}"?\n\nВсе его смены также будут удалены.`
      )
    ) {
      const userRef = ref(db, `users/${userId}`);
      await remove(userRef);

      const userEvents = Object.values(events).filter(
        (e) => e.userId === userId
      );
      for (const event of userEvents) {
        await handleDeleteEvent(event.id, false);
      }

      const newPendingEvents = pendingEvents.filter((e) => e.userId !== userId);
      savePendingEvents(newPendingEvents);
    }
  };

  const getUserById = (userId) => {
    return users.find((user) => user.id === userId);
  };

  const getAllEventsForDate = (dateStr) => {
    const published = Object.values(events)
      .filter((e) => e.date === dateStr)
      .map((event) => ({
        ...event,
        user: getUserById(event.userId),
        isPending: false,
      }));

    const pending = pendingEvents
      .filter((e) => e.date === dateStr)
      .map((event) => ({
        ...event,
        user: getUserById(event.userId),
        isPending: true,
      }));

    return [...published, ...pending].filter((event) => event.user);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateToYMD(date);
      const dayEvents = getAllEventsForDate(dateStr);
      const hasEvent = dayEvents.length > 0;
      const isToday = formatDateToYMD(new Date()) === dateStr;
      const hasPending = dayEvents.some((e) => e.isPending);

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasEvent ? "has-event" : ""} ${
            isToday ? "today" : ""
          } ${selectedDate === dateStr ? "selected" : ""}`}
          onClick={() => handleDateClick(date)}
        >
          <div className="day-number">{day}</div>

          {hasEvent && (
            <div className="shift-square">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`shift-item ${event.isPending ? "pending" : ""}`}
                  style={{
                    backgroundColor: event.user?.color || "#4A90E2",
                    opacity: event.isPending ? 0.55 : 1,
                    borderLeft: event.isPending
                      ? "3px solid rgba(0,0,0,0.2)"
                      : "none",
                  }}
                  onClick={(e) => handleShiftClick(e, event, event.isPending)}
                >
                  <span className="shift-initial">
                    {event.user?.name?.charAt(0) || "?"}
                  </span>
                  <span className="shift-time">{event.startTime}</span>
                  {event.isPending && (
                    <span className="shift-pending-badge">⏳</span>
                  )}
                </div>
              ))}
              {dayEvents.length > 4 && (
                <div className="shift-more">+{dayEvents.length - 4}</div>
              )}
            </div>
          )}

          {hasPending && (
            <div className="pending-indicator">
              <span className="pending-dot"></span>
              <span className="pending-count">
                {dayEvents.filter((e) => e.isPending).length}
              </span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const setIsLoading = (value) => {
    setLoading(value);
  };

  // ============= ПОКАЗЫВАЕМ ЭКРАН ЗАГРУЗКИ =============
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">Загрузка...</div>
      </div>
    );
  }

  // ============= ПОКАЗЫВАЕМ ЭКРАН ВХОДА =============
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // ============= ОСНОВНОЙ ИНТЕРФЕЙС =============
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          {/* <h1 className="app-title">Календарь смен</h1> */}
          <img className="logo-red" src="/img/logo.png" alt="logo" />

          <div className="admin-badge">
            <span className="admin-icon">
              <i class="fa-regular fa-user"></i>
            </span>
            <span className="admin-email">{user.email}</span>
          </div>
          <div className="google-status">
            {isAuthorized ? (
              <span className="status-connected">
                <span className="status-dot" />
                Google Calendar
              </span>
            ) : (
              <button className="btn-google" onClick={loginWithGoogle}>
                Подключить Google
              </button>
            )}
          </div>
        </div>

        <div className="header-actions">
          <div className="bulk-mode-toggle">
            <span className="toggle-label">Masowa publikacja</span>
            <button
              className={`toggle-switch ${bulkMode ? "active" : ""}`}
              onClick={toggleBulkMode}
            >
              <span className="toggle-handle"></span>
            </button>
          </div>

          <button
            className={`btn-icon ${
              pendingEvents.length > 0 ? "has-badge" : ""
            }`}
            onClick={() => setShowBulkModal(true)}
            disabled={pendingEvents.length === 0}
          >
            {pendingEvents.length > 0 && (
              <span className="btn-icon-badge">{pendingEvents.length}</span>
            )}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Oczekują</span>
          </button>

          <button className="btn-icon" onClick={() => setShowStatsModal(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 18H18M4 14L6 9L9 13L13 7L16 11L18 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Statystyki</span>
          </button>

          <button className="btn-icon" onClick={() => setShowUserModal(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M14 6C14 8.20914 12.2091 10 10 10C7.79086 10 6 8.20914 6 6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M2 18C2 15.7909 3.79086 14 6 14H14C16.2091 14 18 15.7909 18 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Pracownicy ({users.length})</span>
          </button>

          <LogoutButton onLogout={() => setUser(null)} />
        </div>
      </header>

      <div
        className={`mode-indicator ${bulkMode ? "bulk-mode" : "normal-mode"}`}
      >
        <div className="mode-icon">
          {bulkMode ? (
            <i class="fa-solid fa-globe"></i>
          ) : (
            <i className="fa-brands fa-slack"></i>
          )}
        </div>

        <div className="mode-text">
          <strong>
            {bulkMode ? "Tryb masowej publikacji" : "Tryb zwykły"}
          </strong>
          <span>
            {bulkMode
              ? "Zmiany są dodawane do listy oczekujących"
              : "Zmiany są natychmiast publikowane w Kalendarzu Google"}
          </span>
        </div>
      </div>

      <div className="month-nav">
        <button className="month-nav-btn" onClick={() => navigateMonth(-1)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 16L6 10L12 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <h2 className="month-title">
          {currentDate.toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button className="month-nav-btn" onClick={() => navigateMonth(1)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M8 16L14 10L8 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="calendar">
        <div className="calendar-weekdays">
          {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">{renderCalendar()}</div>
      </div>

      {/* МАССОВАЯ ПУБЛИКАЦИЯ */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal bulk-modal">
            <div className="modal-header">
              <h3 className="modal-title">Lista oczekujących</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkForm({ selectedEvents: [], sendEmail: true });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-content">
              {pendingEvents.length === 0 ? (
                <div className="empty-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <p>Brak zmian do publikacji</p>
                  <span>Utwórz zmiany w trybie masowej publikacji</span>
                </div>
              ) : (
                <>
                  <div className="bulk-stats">
                    <div className="stat-badge">
                      Łącznie oczekujące:{" "}
                      <strong>{pendingEvents.length}</strong>
                    </div>
                    <div className="stat-badge">
                      Wybrane: <strong>{bulkForm.selectedEvents.length}</strong>
                    </div>
                  </div>

                  <div className="bulk-actionsdwa">
                    <button
                      className="btn-smalldwa"
                      onClick={() =>
                        setBulkForm({
                          ...bulkForm,
                          selectedEvents: pendingEvents.map((e) => e.id),
                        })
                      }
                    >
                      Zaznacz wszystko
                    </button>
                    <button
                      className="btn-smalldwa"
                      onClick={() =>
                        setBulkForm({ ...bulkForm, selectedEvents: [] })
                      }
                    >
                      Odznacz wszystko
                    </button>
                  </div>

                  <div className="pending-events-list">
                    {pendingEvents.map((event) => {
                      const user = users.find((u) => u.id === event.userId);
                      if (!user) return null;

                      const isSelected = bulkForm.selectedEvents.includes(
                        event.id
                      );

                      return (
                        <div
                          key={event.id}
                          className={`pending-event ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => {
                            setBulkForm((prev) => ({
                              ...prev,
                              selectedEvents: isSelected
                                ? prev.selectedEvents.filter(
                                    (id) => id !== event.id
                                  )
                                : [...prev.selectedEvents, event.id],
                            }));
                          }}
                          style={{ "--user-color": user.color }}
                        >
                          <div className="pending-event-check">
                            <div
                              className={`checkbox ${
                                isSelected ? "checked" : ""
                              }`}
                            >
                              {isSelected && "✓"}
                            </div>
                          </div>
                          <div
                            className="pending-event-color"
                            style={{ backgroundColor: user.color }}
                          />
                          <div className="pending-event-info">
                            <div className="pending-event-name">
                              {user.name}
                            </div>
                            <div className="pending-event-title">
                              {event.title}
                            </div>
                            <div className="pending-event-datetime">
                              {event.date} · {event.startTime} — {event.endTime}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isAuthorized && bulkForm.selectedEvents.length > 0 && (
                    <div className="bulk-settings">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={bulkForm.sendEmail}
                          onChange={(e) =>
                            setBulkForm({
                              ...bulkForm,
                              sendEmail: e.target.checked,
                            })
                          }
                        />
                        <span className="monstrclas">
                          Wyślij zaproszenia na e-mail
                        </span>
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkForm({ selectedEvents: [], sendEmail: true });
                }}
              >
                Zamknij
              </button>
              {pendingEvents.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={publishBulkEvents}
                  disabled={
                    bulkForm.selectedEvents.length === 0 ||
                    bulkPublishing ||
                    !isAuthorized
                  }
                >
                  {bulkPublishing ? (
                    <>
                      <span className="spinner-small" />
                      Publikowanie...
                    </>
                  ) : (
                    `Opublikuj (${bulkForm.selectedEvents.length})`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ СМЕНЫ */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal shift-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {eventForm.id
                  ? eventForm.isPending
                    ? "Edycja (oczekuje na publikację)"
                    : "Edycja zmiany"
                  : "Nowa zmiana"}
              </h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setEventForm({
                    id: null,
                    title: "",
                    date: formatDateToYMD(new Date()),
                    startTime: "13:00",
                    endTime: "20:00",
                    userIds: [],
                    sendEmail: true,
                    isPending: false,
                  });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="form-section">
                <label className="form-label">Nazwa zmiany</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                  placeholder="Recepcja, Serwis, Dostępność"
                />
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                  />
                </div>
                <div className="form-section">
                  <label className="form-label">Czas</label>
                  <div className="time-inputs">
                    <input
                      type="time"
                      className="form-input time"
                      value={eventForm.startTime}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          startTime: e.target.value,
                        })
                      }
                    />
                    <span className="time-separator">—</span>
                    <input
                      type="time"
                      className="form-input time"
                      value={eventForm.endTime}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">
                  {eventForm.id
                    ? "Pracownik"
                    : "Pracownicy (można wybrać kilku)"}
                </label>
                {users.length === 0 ? (
                  <div className="empty-users">
                    <p>Brak dodanych pracowników</p>

                    <button
                      className="btn btn-small"
                      onClick={() => {
                        setShowModal(false);
                        setShowUserModal(true);
                      }}
                    >
                      Dodaj pracownika
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="users-grid">
                      {users.map((user) => {
                        const isSelected = eventForm.userIds.includes(user.id);
                        return (
                          <div
                            key={user.id}
                            className={`user-card ${
                              isSelected ? "selected" : ""
                            }`}
                            onClick={() => toggleUserSelection(user.id)}
                            style={{ "--user-color": user.color }}
                          >
                            <div
                              className="user-avatar"
                              style={{ backgroundColor: user.color }}
                            >
                              {user.name.charAt(0)}
                            </div>
                            <span className="user-name">{user.name}</span>
                            {isSelected && (
                              <span className="user-check">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {eventForm.userIds.length > 0 && (
                      <div className="selected-users">
                        <span className="selected-count">
                          {eventForm.id ? "Сотрудник:" : "Wybrane:"}{" "}
                          {eventForm.userIds.length}
                        </span>
                        <div className="selected-tags">
                          {eventForm.userIds.map((userId) => {
                            const user = users.find((u) => u.id === userId);
                            return user ? (
                              <span
                                key={userId}
                                className="selected-tag"
                                style={{
                                  backgroundColor: `${user.color}20`,
                                  borderColor: user.color,
                                }}
                              >
                                <span
                                  style={{ backgroundColor: user.color }}
                                  className="tag-dot"
                                ></span>
                                {user.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!eventForm.id && (
                <div className={`mode-badge ${bulkMode ? "bulk" : "direct"}`}>
                  <div className="mode-icon">
                    {bulkMode ? (
                      <i class="fa-solid fa-globe"></i>
                    ) : (
                      <i className="fa-brands fa-slack"></i>
                    )}
                  </div>
                  <span className="spamzmiantit">
                    {bulkMode
                      ? "Zmiany są dodawane do listy oczekujących"
                      : "Zmiany są natychmiast publikowane w Kalendarzu Google"}
                  </span>
                </div>
              )}

              {eventForm.isPending && (
                <div className="mode-badge bulk">
                  <span className="badge-icon">
                    <i class="fa-regular fa-hourglass"></i>
                  </span>
                  <span>Ta zmiana oczekuje na publikację</span>
                </div>
              )}

              {isAuthorized &&
                eventForm.userIds.length > 0 &&
                !eventForm.isPending && (
                  <div className="form-section google-settings">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={eventForm.sendEmail}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            sendEmail: e.target.checked,
                          })
                        }
                      />
                      <span>Wyślij zaproszenia do Kalendarza Google</span>
                    </label>
                  </div>
                )}
            </div>

            <div className="modal-footer">
              {eventForm.id && (
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleDeleteEvent(eventForm.id, eventForm.isPending)
                  }
                >
                  Usuń
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEventForm({
                    id: null,
                    title: "",
                    date: formatDateToYMD(new Date()),
                    startTime: "13:00",
                    endTime: "20:00",
                    userIds: [],
                    sendEmail: true,
                    isPending: false,
                  });
                }}
              >
                Anuluj
              </button>
              <button
                className="btn btn-primary"
                onClick={eventForm.id ? handleUpdateEvent : handleCreateEvent}
                disabled={
                  eventForm.userIds.length === 0 || !eventForm.title.trim()
                }
              >
                {eventForm.id ? "Zapisz" : "Utwórz zmianę"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА СТАТИСТИКИ */}
      {showStatsModal && (
        <div className="modal-overlay">
          <div className="modal stats-modal">
            <div className="modal-header">
              <h3 className="modal-title">Statystyki</h3>
              <button
                className="modal-close"
                onClick={() => setShowStatsModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="stats-content">
              {users.length === 0 ? (
                <div className="empty-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <p>Brak danych do statystyk</p>
                  <span>Dodaj pracowników i zmiany</span>
                </div>
              ) : (
                <>
                  <div className="stats-overview">
                    <div className="stat-card">
                      <div className="stat-value">{users.length}</div>
                      <div className="stat-label">Pracowników</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {Object.keys(events).length}
                      </div>
                      <div className="stat-label">Opublikowano</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{pendingEvents.length}</div>
                      <div className="stat-label">Oczekujące</div>
                    </div>
                  </div>

                  <div className="stats-employees">
                    {Object.values(stats).map((userStat) => (
                      <div
                        key={userStat.user.id}
                        className="employee-stat"
                        style={{ "--user-color": userStat.user.color }}
                      >
                        <div className="employee-header">
                          <div className="employee-info">
                            <div
                              className="employee-avatar"
                              style={{ backgroundColor: userStat.user.color }}
                            >
                              {userStat.user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="employee-name">
                                {userStat.user.name}
                              </div>
                              <div className="employee-email">
                                {userStat.user.email}
                              </div>
                            </div>
                          </div>
                          <div className="employee-total">
                            <div className="total-shifts">
                              {userStat.totalShifts} zmian
                            </div>
                            <div className="total-hours">
                              {userStat.totalHours.toFixed(1)} h
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА УПРАВЛЕНИЯ СОТРУДНИКАМИ */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal users-modal">
            <div className="modal-header">
              <h3 className="modal-title">Pracownicy</h3>
              <button
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="users-content">
              <div className="add-user-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Imię i nazwisko"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <select
                  className="form-select"
                  value={newUser.color}
                  onChange={(e) =>
                    setNewUser({ ...newUser, color: e.target.value })
                  }
                >
                  {GOOGLE_COLORS.map((color) => (
                    <option key={color.hex} value={color.hex}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div
                  className="color-preview"
                  style={{ backgroundColor: newUser.color }}
                />
                <button
                  className="btn btn-primary add-user-btn"
                  onClick={handleAddUser}
                  disabled={!newUser.name.trim() || !newUser.email.trim()}
                >
                  Dodaj
                </button>
              </div>

              <div className="users-list">
                {users.length === 0 ? (
                  <div className="empty-state">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M12 4V20M4 12H20" strokeWidth="1.5" />
                    </svg>
                    <p className="ptitmonst">Brak pracowników</p>
                    <span className="ptitmonst">
                      Dodaj pierwszego pracownika
                    </span>
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="user-list-item"
                      style={{ "--user-color": user.color }}
                    >
                      <div
                        className="user-avatar-large"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="user-details">
                        <div className="user-name-large">{user.name}</div>
                        <div className="user-email-small">{user.email}</div>
                        <div className="user-color-name">
                          {GOOGLE_COLORS.find((c) => c.hex === user.color)
                            ?.name || "Цвет"}
                        </div>
                      </div>
                      <button
                        className="btn-icon-small"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M2 4H14M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M12 6V14C12 14.5523 11.5523 15 11 15H5C4.44772 15 4 14.5523 4 14V6"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
