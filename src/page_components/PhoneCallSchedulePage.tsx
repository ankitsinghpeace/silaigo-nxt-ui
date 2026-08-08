"use client";
import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import {
  bookAppointmentApi,
  getAppointmentsSlotsApi,
} from "@/services/modules/appointments.api";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import { schedulePhoneCall } from "@/services/modules/phone-call-schedule.api";
import { formatDate } from "@/components/customization/AppointmentScheduler";
import { format } from "date-fns";
import { useOrderFlow } from "@/contexts/OrderFlowContext";
import { useRouter } from "@/lib/next-router-compat";

interface TimeSlot {
  time: string;
  remaining: number;
  [key: string]: any;
}

interface Appointment {
  date: Date | undefined;
  timeSlot: string;
  notes: string;
}

const convertTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
  return slots.map((slot) => {
    const [hours, minutes] = slot.time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert to 12-hour format
    const formattedTime = `${hours12}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    return {
      ...slot,
      label: formattedTime,
    };
  });
};

const PhonceCallSchedulerPage: React.FC = () => {
  const { handleBookAppoinmentClicked } = useOrderFlow();

  useEffect(() => {
    handleBookAppoinmentClicked();
  }, []);

  const navigate = useRouter();
  const [appointment, setAppointment] = useState<Appointment>({
    date: undefined,
    timeSlot: "",
    notes: "",
  });

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<
    "pending" | "booking" | "success"
  >("pending");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = router.query;

  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  const onDateSelect = async (date: Date) => {
    setAppointment({ ...appointment, date, timeSlot: "" });
    const formattedDate = formatDate(date);
    setIsLoadingSlots(true);
    setBookingStatus("pending");
    try {
      const res = await getAppointmentsSlotsApi(formattedDate);
      const convertedSlots = convertTimeSlots(res);
      setAvailableSlots(convertedSlots);
    } catch (error) {
      const err = generateErrorMessage(error);
      toast({
        title: "Error fetching slots",
        description: err || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const bookSlot = async () => {
    const { date, timeSlot, notes } = appointment;
    if (!date || !timeSlot) {
      toast({
        title: "Error booking slot",
        description: "Please select a date, time slot and address",
        variant: "destructive",
      });
      return;
    }
    setBookingStatus("booking");
    try {
      const appointmentDate = new Date(date);
      const [hh, mm] = timeSlot.split(":");
      appointmentDate.setHours(Number(hh), Number(mm));
      await schedulePhoneCall({
        category: Number(searchParams.catId),
        appointmentDate: appointmentDate,
        notes,
      });

      toast({
        title: "Phone call scheduled successfully",
        description: "You will receive a call from our team",
      });

      setBookingStatus("success");
      const formattedDate = date.toISOString().split("T")[0]; // e.g., "2025-07-13"
      navigate(
        `/call-schedule-confirmation?date=${encodeURIComponent(
          formattedDate,
        )}&time=${encodeURIComponent(timeSlot)}&category=${encodeURIComponent(
          Number(searchParams.catId),
        )}`,
      );
    } catch (error) {
      setBookingStatus("pending");
      const err = generateErrorMessage(error);
      toast({
        title: "Error booking slot",
        description: err || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 w-full text-center gap-6">
      <h3 className="text-2xl font-playfair font-bold">Book an Appointment</h3>
      <p className="text-neutral-charcoal/70">
        Schedule an appointment with our tailors for measurements and
        consultation.
      </p>

      {bookingStatus === "success" && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
          <p className="text-sm">
            Your call has been scheduled for {format(appointment.date, "PPP")}{" "}
            at {appointment.timeSlot}. You will receive a call from our team
            regarding your queries. Thank you
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CalendarIcon className="mr-2 h-5 w-5" /> Select Date
            </CardTitle>
            <CardDescription>
              Choose a convenient date for your appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-2 sm:p-2 md:p-6 lg:p-6">
            <Calendar
              mode="single"
              selected={appointment.date}
              onSelect={onDateSelect}
              disabled={disabledDays}
              className="rounded-md border pointer-events-auto w-max "
            />
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Clock className="mr-2 h-5 w-5" /> Select Time
            </CardTitle>
            <CardDescription>Choose an available time slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={appointment.timeSlot}
              onValueChange={(val) => {
                setAppointment({ ...appointment, timeSlot: val });
              }}
              disabled={!appointment.date || isLoadingSlots}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingSlots
                      ? "Loading available slots..."
                      : !appointment.date
                        ? "Select a date first"
                        : "Select time slot"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No slots available for this date
                  </div>
                ) : (
                  availableSlots.map((slot) => (
                    <SelectItem
                      key={slot.time}
                      value={slot.time}
                      disabled={slot.remaining <= 0}
                    >
                      {slot.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Additional Notes (Optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Add any special requirements or notes for your appointment..."
                value={appointment.notes}
                onChange={(e) => {
                  setAppointment((prev) => {
                    return {
                      ...prev,
                      notes: e.target.value,
                    };
                  });
                }}
                className="min-h-[100px] resize-none"
                disabled={bookingStatus === "booking"}
              />
            </div>

            <div className="mt-8">
              <Button
                onClick={bookSlot}
                disabled={bookingStatus === "booking"}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {bookingStatus === "booking" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking Appointment...
                  </>
                ) : (
                  "Book Slot"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhonceCallSchedulerPage;
