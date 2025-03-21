import React, { useState, useEffect } from "react";
import { Container, useMantineTheme, Space } from "@mantine/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import ICAL from "ical.js";
import './../App.css';

const CustomCalendar = () => {
   const [events, setEvents] = useState([]);
   const [icsEventsLoaded, setIcsEventsLoaded] = useState(false);
   const theme = useMantineTheme();

   useEffect(() => {
      const loadEvents = async () => {
         try {
            const response = await fetch("/calendarifestius_es.ics");
            const data = await response.text();
            const jcalData = ICAL.parse(data);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents("vevent");
            const fcEvents = vevents.map((vevent) => {
               const event = new ICAL.Event(vevent);
               return {
                  id: `ics-${event.uid}`,
                  title: event.summary,
                  start: event.startDate.toJSDate(),
                  end: event.endDate ? event.endDate.toJSDate() : null,
                  allDay: true,
                  color: theme.colors.accentSuccess[0],
               };
            });

            const savedEvents = JSON.parse(localStorage.getItem("userEvents")) || [];
            setEvents([...fcEvents, ...savedEvents]);
            setIcsEventsLoaded(true);
         } catch (err) {
            console.error("Error fetching ICS file:", err);
         }
      };

      if (!icsEventsLoaded) {
         loadEvents();
      }
   }, [theme.colors.accentSuccess, icsEventsLoaded]);

   const saveUserEvents = (updatedEvents) => {
      const icsEvents = events.filter(event => event.id.startsWith("ics-"));
      const userEvents = updatedEvents.filter(event => !event.id.startsWith("ics-"));
      setEvents([...icsEvents, ...userEvents]);
      localStorage.setItem("userEvents", JSON.stringify(userEvents));
   };

   const handleDateClick = (info) => {
      const title = prompt("Enter event title:");
      if (!title) return;
      const newEvent = {
         id: `user-${Date.now().toString()}`,
         title,
         start: info.date,
         allDay: info.allDay,
         color: theme.colors.accentInfo[0],
      };
      saveUserEvents([...events, newEvent]);
   };

   const handleEventChange = (changeInfo) => {
      const updatedEvents = events.map((event) =>
         event.id === changeInfo.event.id
            ? {
                 ...event,
                 start: changeInfo.event.start,
                 end: changeInfo.event.end,
              }
            : event
      );
      saveUserEvents(updatedEvents);
   };

   const handleEventClick = (clickInfo) => {
      if (window.confirm(`Delete event '${clickInfo.event.title}'?`)) {
         saveUserEvents(events.filter((event) => event.id !== clickInfo.event.id));
      }
   };

   return (
      <Container size={1300}>
         <Space h="xl" />
         <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventChange={handleEventChange}
            editable={true}
            selectable={true}
            dayHeaderContent={(args) => (
               <div style={{ color: theme.colors.accentSuccess[0], fontWeight: "bold" }}>{args.text}</div>
            )}
            headerToolbar={{
               left: "prev,next today",
               center: "title",
               right: "dayGridMonth,dayGridWeek",
            }}
            titleFormat={{ year: "numeric", month: "long" }}
            dayCellContent={(args) => <div style={{ color: theme.colors.accentWarning[0] }}>{args.dayNumberText}</div>}
         />
      </Container>
   );
};

export default CustomCalendar;