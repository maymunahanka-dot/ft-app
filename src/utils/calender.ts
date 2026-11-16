import * as Calendar from "expo-calendar/legacy";
import { Platform } from "react-native";
import { Appointment } from "../types/appointment";
import { ShowToastMessage } from "./random";

import { t as tx } from "@/src/i18n";

// Get or request calendar permission & return editable calendar
async function getDefaultCalendarId(): Promise<string | null> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== "granted") {
      ShowToastMessage({
        preset: "error",
        title: tx("auto.calendarPermissionNotGranted_8d3d"),
        from: "top",
      });
      return null;
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT,
    );

    const editable = calendars.find((c) => c.allowsModifications);

    if (!editable) {
      ShowToastMessage({
        preset: "error",
        title: tx("auto.noEditableCalendarFound_c5ac"),
        from: "top",
      });
      return null;
    }

    return editable.id;
  } catch (error) {
    console.error("Error getting default calendar:", error);
    throw error;
  }
}

export async function createCalendarEvent(
  appointment: Appointment,
): Promise<string | undefined> {
  if (Platform.OS === "ios") return undefined;
  try {
    const calendarId = await getDefaultCalendarId();
    if (!calendarId) return undefined;

    // Parse ISO string date (e.g., "2026-02-09T19:30:29.142Z")
    const startDate = new Date(appointment.date);
    // Duration is in hours, convert to milliseconds (hours * 60 minutes * 60 seconds * 1000 ms)
    const endDate = new Date(
      startDate.getTime() + (appointment.duration || 1) * 60 * 60 * 1000,
    );

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.log("Invalid dates - startDate:", appointment.date);
      ShowToastMessage({
        preset: "error",
        title: tx("auto.invalidDateOrTimeFormat_1dd4"),
        from: "top",
      });
      return undefined;
    }

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `${appointment.clientName} - ${appointment.service}`,
      startDate,
      endDate,
      notes: appointment.notes || "",
      timeZone: Platform.OS === "ios" ? undefined : "UTC",
    });

    console.log("Calendar event created:", eventId);
    ShowToastMessage({
      preset: "done",
      title: tx("auto.addedToCalendar_52a4"),
      from: "top",
    });
    return eventId;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    ShowToastMessage({
      preset: "error",
      title: tx("auto.failedToCreateCalendarEvent_17bf"),
      from: "top",
    });
    return undefined;
  }
}

export async function updateCalendarEvent(
  eventId: string,
  appointment: Appointment,
): Promise<void> {
  if (Platform.OS === "ios") return;
  try {
    if (!eventId) {
      ShowToastMessage({
        preset: "error",
        title: tx("auto.eventIdIsRequiredFor_891f"),
        from: "top",
      });
      return;
    }

    // Parse ISO string date (e.g., "2026-02-09T19:30:29.142Z")
    const startDate = new Date(appointment.date);
    // Duration is in hours, convert to milliseconds
    const endDate = new Date(
      startDate.getTime() + (appointment.duration || 1) * 60 * 60 * 1000,
    );

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.log("Invalid dates - startDate:", appointment.date);
      ShowToastMessage({
        preset: "error",
        title: tx("auto.invalidDateOrTimeFormat_1dd4"),
        from: "top",
      });
      return;
    }

    await Calendar.updateEventAsync(eventId, {
      title: `${appointment.clientName} - ${appointment.service}`,
      startDate,
      endDate,
      notes: appointment.notes || "",
    });

    console.log("Calendar event updated:", eventId);
    ShowToastMessage({
      preset: "done",
      title: tx("auto.calendarUpdated_0b3e"),
      from: "top",
    });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    ShowToastMessage({
      preset: "error",
      title: tx("auto.failedToUpdateCalendarEvent_9f9d"),
      from: "top",
    });
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (Platform.OS === "ios") return;
  try {
    if (!eventId) {
      ShowToastMessage({
        preset: "error",
        title: tx("auto.eventIdIsRequiredFor_7a21"),
        from: "top",
      });
      return;
    }

    await Calendar.deleteEventAsync(eventId);
    console.log("Calendar event deleted:", eventId);
    ShowToastMessage({
      preset: "done",
      title: tx("auto.removedFromCalendar_5335"),
      from: "top",
    });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    ShowToastMessage({
      preset: "error",
      title: tx("auto.failedToDeleteCalendarEvent_7002"),
      from: "top",
    });
  }
}

// Helper function to check if calendar permissions are granted

// Helper function to get all available calendars
