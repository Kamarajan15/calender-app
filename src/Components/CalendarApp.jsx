import React, { useState } from 'react';
import './CalendarApp.css';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  compareAsc
} from 'date-fns';

const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [eventText, setEventText] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDate, setEventDate] = useState('');

  const startDate = startOfWeek(startOfMonth(currentDate));
  const endDate = endOfWeek(endOfMonth(currentDate));

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handleAddEvent = () => {
    if (!eventDate || !eventText || !eventTime) return;

    const newEvent = {
      date: eventDate,
      time: eventTime,
      text: eventText
    };

    const updated = [...events, newEvent];
    setEvents(updated);
    setEventDate('');
    setEventTime('');
    setEventText('');
    setShowAddPopup(false);
  };

  const deleteEvent = (indexToDelete, monthKey) => {
    const updated = events.filter((e, i) => {
      const dt = new Date(`${e.date}T${e.time}`);
      const key = format(dt, 'MMMM yyyy');
      return !(key === monthKey && i === indexToDelete);
    });
    setEvents(updated);
  };

  const today = new Date();

const upcomingEvents = events
  .map(e => ({ ...e, datetime: new Date(`${e.date}T${e.time}`) }))
  .filter(e => e.datetime > today)
  .sort((a, b) => compareAsc(a.datetime, b.datetime))
  .reduce((acc, ev) => {
    const month = format(ev.datetime, 'MMMM yyyy');
    if (!acc[month]) acc[month] = [];
    acc[month].push(ev);
    return acc;
  }, {});


  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <div className="calendar-app">
      <header className="app-header">
        <h1>Calendar App</h1>
      </header>

      <main className="main-content">
        <div>
        <div className="calendar-selectors">
              <select
                value={format(currentDate, 'M') - 1}
                onChange={(e) => {
                  const newMonth = new Date(currentDate);
                  newMonth.setMonth(Number(e.target.value));
                  setCurrentDate(newMonth);
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {format(new Date(2000, i, 1), 'MMMM')}
                  </option>
                ))}
              </select>

              <select
                value={currentDate.getFullYear()}
                onChange={(e) => {
                  const newYear = new Date(currentDate);
                  newYear.setFullYear(Number(e.target.value));
                  setCurrentDate(newYear);
                }}
              >
                {Array.from({ length: 51 }, (_, i) => 2000 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
        </div>
        <div className="main-container">
          <div className="calendar-header">
            <button onClick={() => setCurrentDate(prev => subMonths(prev, 1))}>{'<'}</button>
            <button onClick={goToToday} className='calender-btn' style={{marginRight:'0px'}}>Today</button>
            <button onClick={() => setShowAddPopup(true)} className='calender-btn'>+ Add Event</button>
            <button onClick={() => setCurrentDate(prev => addMonths(prev, 1))}>{'>'}</button>
          </div>

          <div className="weekday-row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="weekday">{d}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map((d, i) => {
              const dateStr = format(d, 'yyyy-MM-dd');
              const hasEvent = events.some(ev => ev.date === dateStr);

              return (
                <div
                  key={i}
                  className={`day-cell ${isSameMonth(d, currentDate) ? '' : 'faded'} ${isToday(d) ? 'today' : ''} ${selectedDate && dateStr === format(selectedDate, 'yyyy-MM-dd') ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(d)}
                >
                  <div className="day-number">{format(d, 'd')}</div>
                  {hasEvent && <div className="event-dot" ></div>}
                </div>
              );
            })}
          </div>
          {selectedDate && (
            <div className="selected-events">
              <h3>Events on {format(selectedDate, 'dd MMMM yyyy')}</h3>
              {events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).length > 0 ? (
                events
                  .filter(e => e.date === format(selectedDate, 'yyyy-MM-dd'))
                  .map((e, idx) => (
                    <div key={idx} className="event-item">
                      <strong>{e.time}</strong> - {e.text}
                    </div>
                  ))
              ) : (
                <p>No events for this day.</p>
              )}
            </div>
          )}
        </div>

        <div className="event-list-box">
          <h3>Upcoming Events</h3>
          <div className="event-list">
            {Object.keys(upcomingEvents).map(month => (
              <div key={month} className="event-month">
                <h4>{month}</h4>
                {upcomingEvents[month].map((e, idx) => (
                  <div key={idx} className="event-item">
                    <strong>{format(e.datetime, 'dd')}</strong> - <span>{e.time}</span> - <span>{e.text}</span>
                    <button className="delete-btn" onClick={() => deleteEvent(idx, month)}>✕</button>
                  </div>
                ))}
              </div>
            ))}
            {!Object.keys(upcomingEvents).length && <p>No upcoming events.</p>}
          </div>
        </div>

        {showAddPopup && (
          <div className="add-event-popup">
            <div className="add-event-box">
              <h3 style={{marginBottom:"10px"}}>Add Event</h3>
              <div className="add-event-form">
                <label>Date:</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
                <label>Time:</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
                <label>Event:</label>
                <input
                  type="text"
                  placeholder="Event Details"
                  value={eventText}
                  onChange={(e) => setEventText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding:"20px"}}>
                  <button onClick={() => setShowAddPopup(false)} style={{background:"none", color:"black", border:"1px solid #000"}}>Cancel</button>
                  <button onClick={handleAddEvent}>Add</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CalendarApp;
