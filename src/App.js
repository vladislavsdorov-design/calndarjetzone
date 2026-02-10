import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";

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

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Google API конфигурация
const CLIENT_ID =
  "1068282317957-eulj4v3sm03pcl2vu5ub9cfu1shard5p.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// Цвета для пользователей
const USER_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

// Функция для правильного форматирования даты в YYYY-MM-DD
const formatDateToYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authWindow, setAuthWindow] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: "",
    date: formatDateToYMD(new Date()),
    startTime: "13:00",
    endTime: "20:00",
    userId: "",
    sendEmail: true,
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    color: USER_COLORS[0],
  });

  // Инициализация приложения
  useEffect(() => {
    loadInitialData();

    // Проверяем авторизацию при загрузке
    const token = localStorage.getItem("google_token");
    if (token) {
      setIsAuthorized(true);
      verifyToken(token);
    }

    // Обработка сообщений от popup окна авторизации
    window.addEventListener("message", handleAuthMessage);

    return () => {
      window.removeEventListener("message", handleAuthMessage);
      if (authWindow) authWindow.close();
    };
  }, []);

  const handleAuthMessage = (event) => {
    // Защита от кросс-доменных атак
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

    // Загружаем данные из Firebase
    await loadUsersFromFirebase();
    await loadEventsFromFirebase();

    setIsLoading(false);
  };

  // Загрузка событий из Firebase
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

  // Загрузка пользователей из Firebase
  const loadUsersFromFirebase = () => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.values(data);
        setUsers(usersArray);
      } else {
        // Создаем дефолтных пользователей
        createDefaultUsers();
      }
    });
  };

  const createDefaultUsers = async () => {
    const defaultUsers = [
      {
        id: "1",
        name: "Иван Иванов",
        email: "ivan@example.com",
        color: USER_COLORS[0],
        isActive: true,
      },
      {
        id: "2",
        name: "Мария Петрова",
        email: "maria@example.com",
        color: USER_COLORS[1],
        isActive: true,
      },
      {
        id: "3",
        name: "Алексей Сидоров",
        email: "alexey@example.com",
        color: USER_COLORS[2],
        isActive: true,
      },
    ];

    const usersRef = ref(db, "users");
    const usersObj = {};
    defaultUsers.forEach((user) => {
      usersObj[user.id] = user;
    });

    await set(usersRef, usersObj);
    setUsers(defaultUsers);
  };

  // Авторизация Google через popup
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

    // Проверяем URL popup окна на наличие токена
    const checkTokenInterval = setInterval(() => {
      try {
        if (win && win.closed) {
          clearInterval(checkTokenInterval);
          setAuthWindow(null);
          return;
        }

        if (win && win.location.href) {
          const url = new URL(win.location.href);
          const hash = url.hash;

          if (hash.includes("access_token=")) {
            const token = hash.split("access_token=")[1].split("&")[0];

            // Отправляем токен в основное окно
            window.postMessage(
              {
                type: "google_auth_success",
                token: token,
              },
              window.location.origin
            );

            clearInterval(checkTokenInterval);
          }
        }
      } catch (error) {
        // Игнорируем ошибки доступа к cross-origin
      }
    }, 500);
  };

  // Альтернативный способ - через redirect (если popup блокируется)
  const loginWithGoogleRedirect = () => {
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent(SCOPES);
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;
    window.location.href = authUrl;
  };

  // Проверяем токен в URL после redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token=")) {
      const token = hash.split("access_token=")[1].split("&")[0];
      localStorage.setItem("google_token", token);
      setIsAuthorized(true);

      // Очищаем URL
      window.location.hash = "";
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("google_token");
    setIsAuthorized(false);
    alert("Вы вышли из Google Calendar");
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

  // Создание события в Google Calendar с участником (attendee)
  const createGoogleCalendarEvent = async (eventData) => {
    const token = localStorage.getItem("google_token");
    if (!token) {
      console.error("Нет токена авторизации");
      return null;
    }

    const user = users.find((u) => u.id === eventData.userId);
    if (!user) {
      console.error("Пользователь не найден");
      return null;
    }

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
      summary: user
        ? `${user.name} - ${eventData.title || "Смена"}`
        : eventData.title || "Смена",
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      description: `Работник: ${user.name}\nEmail: ${user.email}\nСмена: ${
        eventData.title || "Рабочая смена"
      }`,
    };

    // ДОБАВЛЯЕМ УЧАСТНИКА (ATTENDEE) ДЛЯ ОТПРАВКИ ПРИГЛАШЕНИЯ
    if (user.email && eventData.sendEmail) {
      event.attendees = [
        {
          email: user.email,
          displayName: user.name,
          responseStatus: "needsAction", // "требуется ответ"
        },
      ];
    }

    try {
      // Параметры запроса
      const queryParams = new URLSearchParams();
      if (eventData.sendEmail && user.email) {
        queryParams.append("sendUpdates", "all"); // Отправляем уведомления всем участникам
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
        const errorText = await response.text();
        console.error("Ошибка создания события:", response.status, errorText);

        if (response.status === 401) {
          // Токен устарел
          localStorage.removeItem("google_token");
          setIsAuthorized(false);
          alert("Сессия истекла. Пожалуйста, войдите снова.");
        }

        return null;
      }

      const data = await response.json();
      console.log("Событие создано:", data);

      // Если email был отправлен, показываем подтверждение
      if (eventData.sendEmail && user.email && data.attendees) {
        console.log(`Приглашение отправлено на ${user.email}`);
      }

      return data.id;
    } catch (error) {
      console.error("Ошибка создания события в Google Calendar:", error);
      return null;
    }
  };

  const deleteGoogleCalendarEvent = async (googleEventId) => {
    const token = localStorage.getItem("google_token");
    if (!token) return;

    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}?sendUpdates=all`;

      await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Событие удалено из Google Calendar");
    } catch (error) {
      console.error("Ошибка удаления события из Google Calendar:", error);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title.trim()) {
      alert("Введите название смены");
      return;
    }

    if (!eventForm.userId) {
      alert("Выберите работника для смены");
      return;
    }

    const user = users.find((u) => u.id === eventForm.userId);
    if (!user) {
      alert("Выбранный работник не найден");
      return;
    }

    let googleEventId = null;
    if (isAuthorized) {
      googleEventId = await createGoogleCalendarEvent(eventForm);
      if (!googleEventId) {
        alert(
          "Не удалось создать событие в Google Calendar. Проверьте авторизацию."
        );
        return;
      }
    }

    const eventId = await saveEventToFirebase({
      ...eventForm,
      googleEventId,
      createdAt: new Date().toISOString(),
    });

    setEvents((prev) => ({
      ...prev,
      [eventId]: { ...eventForm, googleEventId, id: eventId },
    }));

    // Показываем уведомление об отправке email
    if (eventForm.sendEmail && user.email) {
      alert(
        `✅ Смена создана!\n\nРаботник: ${user.name}\nEmail: ${user.email}\n\nПриглашение отправлено на email работника.`
      );
    } else {
      alert(`✅ Смена создана для ${user.name}`);
    }

    setEventForm({
      title: "",
      date: formatDateToYMD(new Date()),
      startTime: "13:00",
      endTime: "20:00",
      userId: "",
      sendEmail: true,
    });
    setShowModal(false);
  };

  const handleDeleteEvent = async (eventId, googleEventId) => {
    if (
      window.confirm(
        "Удалить эту смену?\n\nСобытие будет удалено из календаря и работник получит уведомление."
      )
    ) {
      if (isAuthorized && googleEventId) {
        await deleteGoogleCalendarEvent(googleEventId);
      }

      await deleteEventFromFirebase(eventId);

      const newEvents = { ...events };
      delete newEvents[eventId];
      setEvents(newEvents);

      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      userId: event.userId || "",
      sendEmail: true,
    });
    setShowModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    const user = users.find((u) => u.id === eventForm.userId);
    if (!user) {
      alert("Выбранный работник не найден");
      return;
    }

    // Удаляем старое событие из Google Calendar
    if (isAuthorized && selectedEvent.googleEventId) {
      await deleteGoogleCalendarEvent(selectedEvent.googleEventId);
    }

    // Создаем новое событие в Google Calendar
    let googleEventId = null;
    if (isAuthorized) {
      googleEventId = await createGoogleCalendarEvent(eventForm);
    }

    // Обновляем в Firebase
    const updatedEvent = {
      ...selectedEvent,
      ...eventForm,
      googleEventId: googleEventId || selectedEvent.googleEventId,
    };

    await saveEventToFirebase(updatedEvent, selectedEvent.id);

    setEvents((prev) => ({
      ...prev,
      [selectedEvent.id]: updatedEvent,
    }));

    // Показываем уведомление
    if (eventForm.sendEmail && user.email) {
      alert(`✅ Смена обновлена!\n\nПриглашение отправлено на ${user.email}`);
    }

    setSelectedEvent(null);
    setEventForm({
      title: "",
      date: formatDateToYMD(new Date()),
      startTime: "13:00",
      endTime: "20:00",
      userId: "",
      sendEmail: true,
    });
    setShowModal(false);
  };

  const handleDateClick = (date) => {
    const dateStr = formatDateToYMD(date);
    const existingEvents = Object.values(events).filter(
      (e) => e.date === dateStr
    );

    if (existingEvents.length > 0) {
      setSelectedEvent(existingEvents[0]);
      setEventForm({
        title: existingEvents[0].title,
        date: dateStr,
        startTime: existingEvents[0].startTime,
        endTime: existingEvents[0].endTime,
        userId: existingEvents[0].userId || "",
        sendEmail: true,
      });
      setShowModal(true);
    } else {
      setSelectedEvent(null);
      setEventForm({
        title: "",
        date: dateStr,
        startTime: "13:00",
        endTime: "20:00",
        userId: "",
        sendEmail: true,
      });
      setShowModal(true);
    }
  };

  // Управление пользователями
  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert("Заполните имя и email пользователя");
      return;
    }

    // Проверяем email на валидность
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert("Введите корректный email адрес");
      return;
    }

    const newUserId = Date.now().toString();
    const userToAdd = {
      ...newUser,
      id: newUserId,
      isActive: true,
    };

    const userRef = ref(db, `users/${newUserId}`);
    await set(userRef, userToAdd);

    setUsers((prev) => [...prev, userToAdd]);
    setNewUser({ name: "", email: "", color: USER_COLORS[0] });

    alert(
      `✅ Работник "${userToAdd.name}" добавлен!\n\nEmail: ${userToAdd.email}\n\nТеперь можно назначать смены этому работнику.`
    );

    setShowUserModal(false);
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (
      window.confirm(
        `Удалить работника "${user.name}"?\n\nВсе его смены также будут удалены.`
      )
    ) {
      const userRef = ref(db, `users/${userId}`);
      await remove(userRef);

      setUsers((prev) => prev.filter((u) => u.id !== userId));

      // Также удаляем все события этого пользователя
      const userEvents = Object.values(events).filter(
        (e) => e.userId === userId
      );
      for (const event of userEvents) {
        await handleDeleteEvent(event.id, event.googleEventId);
      }

      alert(`✅ Работник "${user.name}" удален`);
    }
  };

  const getUserById = (userId) => {
    return users.find((user) => user.id === userId);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
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

    // Пустые ячейки в начале
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateToYMD(date);
      const dayEvents = Object.values(events).filter((e) => e.date === dateStr);
      const hasEvent = dayEvents.length > 0;

      // Получаем пользователя для первого события дня
      let eventUser = null;
      if (hasEvent && dayEvents[0].userId) {
        eventUser = getUserById(dayEvents[0].userId);
      }

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasEvent ? "has-event" : ""} ${
            selectedEvent && selectedEvent.date === dateStr ? "selected" : ""
          }`}
          onClick={() => handleDateClick(date)}
          style={
            eventUser?.color
              ? {
                  backgroundColor: `${eventUser.color}20`,
                  borderLeft: `4px solid ${eventUser.color}`,
                }
              : {}
          }
        >
          <div className="day-number">{day}</div>
          {hasEvent && (
            <div className="event-indicator">
              {eventUser && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "3px",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: eventUser.color,
                      marginRight: "5px",
                      border: "1px solid #fff",
                      boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                    }}
                  ></div>
                  <span style={{ fontWeight: "bold", fontSize: "12px" }}>
                    {eventUser.name}
                  </span>
                </div>
              )}
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                {dayEvents[0].title}
              </div>
              <div style={{ fontSize: "10px", color: "#666" }}>
                {dayEvents[0].startTime} - {dayEvents[0].endTime}
                {eventForm.sendEmail && eventUser?.email && (
                  <div style={{ color: "#4CAF50", marginTop: "2px" }}>
                    📧 Приглашение отправлено
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div
        className="loading"
        style={{
          textAlign: "center",
          padding: "100px",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Загрузка приложения...
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ color: "#1976d2", marginBottom: "10px" }}>
        📅 Календарь рабочих смен
      </h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Управление сменами сотрудников с синхронизацией Google Calendar
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          {!isAuthorized ? (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={loginWithGoogle}
                style={{ padding: "12px 24px", fontSize: "16px" }}
              >
                🔑 Войти в Google Calendar
              </button>
              <button
                className="btn"
                onClick={loginWithGoogleRedirect}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f8f9fa",
                }}
              >
                🔄 Альтернативный вход
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                className="btn btn-secondary"
                onClick={logout}
                style={{ padding: "10px 20px" }}
              >
                🚪 Выйти
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 15px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "20px",
                  border: "1px solid #4CAF50",
                }}
              >
                <span style={{ color: "#2e7d32", fontWeight: "bold" }}>
                  ✅ Google Calendar подключен
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            className="btn"
            onClick={() => setShowUserModal(true)}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "12px 24px",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>👥</span>
            <span>Управление работниками ({users.length})</span>
          </button>

          <div style={{ fontSize: "14px", color: "#666", textAlign: "right" }}>
            <div>
              <strong>Всего смен:</strong> {Object.keys(events).length}
            </div>
            <div>
              <strong>Активных работников:</strong>{" "}
              {users.filter((u) => u.isActive).length}
            </div>
          </div>
        </div>
      </div>

      {/* Информация о функциях */}
      {isAuthorized && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#e3f2fd",
            borderRadius: "8px",
            border: "1px solid #2196f3",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "5px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📢</span>
            <span style={{ fontWeight: "bold" }}>Функции подключены:</span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              marginTop: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span>
              <span>Синхронизация с Google Calendar</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span>
              <span>Отправка приглашений на email</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span>
              <span>Двустороннее удаление событий</span>
            </div>
          </div>
        </div>
      )}

      {/* Баннер с информацией о работниках */}
      {users.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#fff8e1",
            borderRadius: "8px",
            border: "1px solid #ffd54f",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>👷</span>
              <span>Список работников ({users.length}):</span>
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              style={{
                padding: "5px 10px",
                fontSize: "12px",
                backgroundColor: "#ffd54f",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Управление
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  backgroundColor: `${user.color}20`,
                  borderRadius: "15px",
                  border: `1px solid ${user.color}`,
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: user.color,
                    marginRight: "6px",
                    border: "1px solid #fff",
                  }}
                ></div>
                {user.name}
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "10px",
                    color: "#666",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    padding: "1px 4px",
                    borderRadius: "8px",
                  }}
                >
                  {
                    Object.values(events).filter((e) => e.userId === user.id)
                      .length
                  }{" "}
                  смен
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="calendar-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          backgroundColor: "#1976d2",
          padding: "15px 20px",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <button
          className="btn"
          onClick={() => navigateMonth(-1)}
          style={{
            padding: "10px 20px",
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          ◀ Предыдущий месяц
        </button>
        <h2 style={{ margin: 0, fontSize: "24px" }}>
          {currentDate.toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          className="btn"
          onClick={() => navigateMonth(1)}
          style={{
            padding: "10px 20px",
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          Следующий месяц ▶
        </button>
      </div>

      <div
        className="calendar-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "8px",
          marginBottom: "30px",
        }}
      >
        {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
          <div
            key={day}
            className="calendar-weekday"
            style={{
              textAlign: "center",
              fontWeight: "bold",
              padding: "12px",
              backgroundColor: "#f5f5f5",
              borderRadius: "5px",
              fontSize: "14px",
            }}
          >
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>

      {/* Модальное окно для добавления/редактирования смены */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal"
            style={{
              backgroundColor: "white",
              padding: 30,
              borderRadius: 10,
              width: "600px",
              maxWidth: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1976d2" }}>
              {selectedEvent
                ? "✏️ Редактировать смену"
                : "➕ Добавить новую смену"}
            </h3>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                Название смены:
              </label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
                placeholder="Например: Дневная смена, Ночная смена, Дежурство"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                Выберите работника:
              </label>

              {users.length === 0 ? (
                <div
                  style={{
                    padding: "25px",
                    textAlign: "center",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "5px",
                    border: "2px dashed #ccc",
                    marginBottom: "15px",
                  }}
                >
                  <p style={{ marginBottom: "15px" }}>
                    Нет добавленных работников
                  </p>
                  <button
                    className="btn"
                    onClick={() => {
                      setShowModal(false);
                      setShowUserModal(true);
                    }}
                    style={{
                      backgroundColor: "#4CAF50",
                      color: "white",
                      padding: "10px 20px",
                    }}
                  >
                    👥 Добавить работника
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "12px",
                      maxHeight: "220px",
                      overflowY: "auto",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      backgroundColor: "#f8f9fa",
                      marginBottom: "15px",
                    }}
                  >
                    {users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() =>
                          setEventForm({ ...eventForm, userId: user.id })
                        }
                        style={{
                          padding: "12px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          border:
                            eventForm.userId === user.id
                              ? `2px solid ${user.color}`
                              : "1px solid #dee2e6",
                          backgroundColor:
                            eventForm.userId === user.id
                              ? `${user.color}20`
                              : "white",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: user.color,
                            marginRight: "12px",
                            border: "2px solid #fff",
                            boxShadow: "0 0 3px rgba(0,0,0,0.3)",
                            flexShrink: 0,
                          }}
                        ></div>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                            {user.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              wordBreak: "break-all",
                            }}
                          >
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {eventForm.userId && (
                    <div
                      style={{
                        padding: "15px",
                        backgroundColor: `${
                          getUserById(eventForm.userId)?.color
                        }15`,
                        borderRadius: "5px",
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${
                          getUserById(eventForm.userId)?.color
                        }`,
                        marginBottom: "15px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: getUserById(eventForm.userId)?.color,
                          marginRight: "15px",
                          flexShrink: 0,
                        }}
                      ></div>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                          Выбран: {getUserById(eventForm.userId)?.name}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            marginTop: "3px",
                          }}
                        >
                          {getUserById(eventForm.userId)?.email}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                Дата смены:
              </label>
              <input
                type="date"
                value={eventForm.date}
                onChange={(e) =>
                  setEventForm({ ...eventForm, date: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 15, marginBottom: 25 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "bold",
                  }}
                >
                  Время начала:
                </label>
                <input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, startTime: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "bold",
                  }}
                >
                  Время окончания:
                </label>
                <input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, endTime: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {isAuthorized && eventForm.userId && (
              <div
                style={{
                  marginBottom: 25,
                  padding: "18px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "8px",
                  border: "1px solid #4CAF50",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={eventForm.sendEmail}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        sendEmail: e.target.checked,
                      })
                    }
                    style={{
                      marginRight: 12,
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: "16px" }}>
                    📧 Отправить приглашение работнику
                  </span>
                </label>
                <div
                  style={{
                    color: "#2e7d32",
                    marginLeft: "32px",
                    fontSize: "14px",
                  }}
                >
                  {eventForm.sendEmail ? (
                    <>
                      <div>
                        ✅ Приглашение будет отправлено на email работника
                      </div>
                      <div style={{ marginTop: "5px", fontSize: "13px" }}>
                        <strong>Работник получит:</strong>
                        <ul style={{ margin: "5px 0 0 15px", padding: 0 }}>
                          <li>Приглашение в Google Calendar</li>
                          <li>Email с деталями смены</li>
                          <li>Возможность подтвердить/отклонить</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div>❌ Приглашение не будет отправлено</div>
                  )}
                </div>
              </div>
            )}

            {!isAuthorized && (
              <div
                style={{
                  marginBottom: 25,
                  padding: "15px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "8px",
                  border: "1px solid #ffc107",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "20px", marginRight: "10px" }}>
                    ⚠️
                  </span>
                  <span style={{ fontWeight: "bold" }}>
                    Google Calendar не подключен
                  </span>
                </div>
                <div
                  style={{
                    color: "#856404",
                    fontSize: "14px",
                    marginLeft: "30px",
                  }}
                >
                  Для отправки приглашений и синхронизации войдите в Google
                  Calendar
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                className="btn"
                onClick={() => {
                  setShowModal(false);
                  setSelectedEvent(null);
                }}
                style={{
                  padding: "12px 24px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f8f9fa",
                  fontSize: "16px",
                }}
              >
                Отмена
              </button>

              {selectedEvent ? (
                <>
                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleDeleteEvent(
                        selectedEvent.id,
                        selectedEvent.googleEventId
                      )
                    }
                    style={{ padding: "12px 24px", fontSize: "16px" }}
                  >
                    🗑️ Удалить
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateEvent}
                    style={{ padding: "12px 24px", fontSize: "16px" }}
                    disabled={!eventForm.userId || !eventForm.title.trim()}
                  >
                    💾 Сохранить изменения
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleCreateEvent}
                  style={{ padding: "12px 24px", fontSize: "16px" }}
                  disabled={!eventForm.userId || !eventForm.title.trim()}
                >
                  ✅ Создать смену
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для управления пользователями */}
      {showUserModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
        >
          <div
            className="modal"
            style={{
              backgroundColor: "white",
              padding: 30,
              borderRadius: 10,
              width: "700px",
              maxWidth: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 25, color: "#4CAF50" }}>
              👥 Управление работниками
            </h3>

            <div style={{ marginBottom: 30 }}>
              <h4 style={{ marginBottom: 15, color: "#333" }}>
                Добавить нового работника:
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto auto",
                  gap: "12px",
                  marginBottom: "15px",
                  alignItems: "end",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 5,
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Имя и фамилия:
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="Иван Иванов"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 5,
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Email:
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="ivan@company.com"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 5,
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Цвет:
                  </label>
                  <select
                    value={newUser.color}
                    onChange={(e) =>
                      setNewUser({ ...newUser, color: e.target.value })
                    }
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "14px",
                      width: "120px",
                      boxSizing: "border-box",
                    }}
                  >
                    {USER_COLORS.map((color, index) => (
                      <option key={color} value={color}>
                        Цвет {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: newUser.color,
                    border: "3px solid #fff",
                    boxShadow: "0 0 5px rgba(0,0,0,0.3)",
                    marginBottom: "5px",
                  }}
                ></div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleAddUser}
                style={{
                  padding: "14px 24px",
                  width: "100%",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
                disabled={!newUser.name.trim() || !newUser.email.trim()}
              >
                ➕ Добавить работника
              </button>
            </div>

            <div>
              <h4 style={{ marginBottom: 15, color: "#333" }}>
                Список работников ({users.length}):
              </h4>
              {users.length === 0 ? (
                <div
                  style={{
                    padding: "50px 20px",
                    textAlign: "center",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "2px dashed #dee2e6",
                    marginBottom: "20px",
                  }}
                >
                  <p
                    style={{
                      color: "#666",
                      marginBottom: "10px",
                      fontSize: "16px",
                    }}
                  >
                    Нет добавленных работников
                  </p>
                  <p style={{ fontSize: "14px", color: "#999" }}>
                    Добавьте первого работника с помощью формы выше
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "15px",
                  }}
                >
                  {users.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        padding: "18px",
                        border: `2px solid ${user.color}`,
                        borderRadius: "8px",
                        backgroundColor: `${user.color}10`,
                        position: "relative",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              backgroundColor: user.color,
                              marginRight: "15px",
                              border: "3px solid #fff",
                              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                              flexShrink: 0,
                            }}
                          ></div>
                          <div>
                            <div
                              style={{
                                fontWeight: "bold",
                                fontSize: "16px",
                                marginBottom: "3px",
                              }}
                            >
                              {user.name}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#666",
                                wordBreak: "break-all",
                              }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          display: "flex",
                          justifyContent: "space-between",
                          paddingTop: "12px",
                          borderTop: "1px solid rgba(0,0,0,0.1)",
                        }}
                      >
                        <span>
                          <strong>Смен:</strong>{" "}
                          {
                            Object.values(events).filter(
                              (e) => e.userId === user.id
                            ).length
                          }
                        </span>
                        <span
                          style={{
                            color: user.isActive ? "#4CAF50" : "#999",
                            fontWeight: user.isActive ? "bold" : "normal",
                          }}
                        >
                          {user.isActive ? "✅ Активен" : "⏸️ Неактивен"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 30,
                paddingTop: "20px",
                borderTop: "1px solid #eee",
              }}
            >
              <button
                className="btn"
                onClick={() => setShowUserModal(false)}
                style={{
                  padding: "12px 24px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f8f9fa",
                  fontSize: "16px",
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-day {
          border: 1px solid #e0e0e0;
          padding: 12px;
          min-height: 130px;
          cursor: pointer;
          position: relative;
          background-color: white;
          border-radius: 6px;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        
        .calendar-day:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          z-index: 1;
        }
        
        .calendar-day.has-event {
          background-color: #f8fff8;
          border-color: #81c784;
        }
        
        .calendar-day.selected {
          border: 2px solid #2196f3;
          background-color: #e3f2fd;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }
        
        .calendar-day.empty {
          background-color: #fafafa;
          cursor: default;
          border: 1px dashed #e0e0e0;
        }
        
        .calendar-day.empty:hover {
          transform: none;
          box-shadow: none;
          background-color: #fafafa;
        }
        
        .day-number {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 16px;
          color: #333;
        }
        
        .event-indicator {
          font-size: 12px;
          color: #333;
          background-color: rgba(255, 255, 255, 0.95);
          padding: 8px;
          border-radius: 5px;
          margin-top: 5px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        .btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .btn-primary {
          background-color: #2196f3;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #1976d2;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }
        
        .btn-secondary {
          background-color: #757575;
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #616161;
        }
        
        .btn-danger {
          background-color: #f44336;
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #d32f2f;
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .btn:disabled:hover {
          opacity: 0.5;
          transform: none;
          box-shadow: none;
        }
        
        @media (max-width: 768px) {
          .calendar-grid {
            grid-template-columns: repeat(7, 1fr);
          }
          
          .calendar-day {
            min-height: 100px;
            padding: 8px;
          }
          
          .day-number {
            font-size: 14px;
          }
          
          .event-indicator {
            font-size: 10px;
            padding: 6px;
          }
          
          .modal {
            padding: 20px !important;
            width: 95% !important;
          }
          
          .calendar-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
          
          .calendar-header h2 {
            font-size: 20px;
          }
          
          .calendar-header button {
            width: 100%;
          }
        }
        
        @media (max-width: 480px) {
          .calendar-day {
            min-height: 80px;
            padding: 5px;
          }
          
          .day-number {
            font-size: 12px;
          }
          
          .event-indicator {
            display: none;
          }
          
          .calendar-day.has-event::after {
            content: '•';
            position: absolute;
            bottom: 5px;
            right: 5px;
            color: #4CAF50;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
