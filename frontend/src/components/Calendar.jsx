import React, { useState, useEffect } from "react";
import { Container, useMantineTheme, Space } from "@mantine/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import ICAL from "ical.js";
import './../App.css'; // Import the CSS file

const CustomCalendar = () => {
   const [events, setEvents] = useState([]);
   const theme = useMantineTheme();

   useEffect(() => {
      fetch("/calendarifestius_es.ics")
         .then((response) => response.text())
         .then((data) => {
            const jcalData = ICAL.parse(data);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents("vevent");
            const fcEvents = vevents.map((vevent) => {
               const event = new ICAL.Event(vevent);
               return {
                  id: event.uid,
                  title: event.summary,
                  start: event.startDate.toJSDate(),
                  end: event.endDate ? event.endDate.toJSDate() : null,
                  allDay: true,
                  color: theme.colors.accentSuccess[0],
               };
            });
            setEvents(fcEvents);
         })
         .catch((err) => console.error("Error fetching ICS file:", err));
   }, []);

   const handleDateClick = (info) => {
      const title = prompt("Enter event title:");
      if (!title) return;
      const newEvent = {
         id: Date.now().toString(),
         title,
         start: info.date,
         allDay: info.allDay,
         color: theme.colors.accentSuccess[0],
      };
      setEvents([...events, newEvent]);
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
      setEvents(updatedEvents);
   };

   const handleEventClick = (clickInfo) => {
      if (window.confirm(`Delete event '${clickInfo.event.title}'?`)) {
         setEvents(events.filter((event) => event.id !== clickInfo.event.id));
      }
   };

   return (
      <Container size={1300}>
         <Space h="md" />
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
               <div style={{ color: theme.colors.accentWarning[0], fontWeight: "bold" }}>{args.text}</div>
            )}
            headerToolbar={{
               left: "prev,next today",
               center: "title",
               right: "dayGridMonth,dayGridWeek",
            }}
            titleFormat={{ year: "numeric", month: "long" }}
            dayCellContent={(args) => <div style={{ color: theme.colors.accentPrimary[0] }}>{args.dayNumberText}</div>}
         />
      </Container>
   );
};

export default CustomCalendar;