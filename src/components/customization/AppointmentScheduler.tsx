"use client";
import React, { useState } from "react";
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
import AddressSelector from "./AddressSelector";
import { useRouter } from "@/lib/next-router-compat";

interface AppointmentSchedulerProps {
  onScheduleAppointment: (
    date: Date,
    timeSlot: string,
    address: IAddress | null,
  ) => void;
  orderDetails: any;
  showAddressSelector?: boolean;
}

interface TimeSlot {
  time: string;
  remaining: number;
  [key: string]: any;
}

interface IAddress {
  _id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const convertTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
  return slots.map((slot) => {
    const [hours, minutes] = slot.time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const formattedTime = `${hours12}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    return {
      ...slot,
      label: formattedTime,
    };
  });
};

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  onScheduleAppointment,
  orderDetails,
  showAddressSelector = true,
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const navigate = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);

  const [addressError, setAddressError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);

  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  const onDateSelect = async (selectedDate: Date) => {
    setDate(selectedDate);
    setDateError(false); // clear error when date selected
    setTimeSlot("");
    const formattedDate = formatDate(selectedDate);
    setIsLoadingSlots(true);
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

  const onTimeSlotChange = (value: string) => {
    setTimeSlot(value);
    setTimeError(false); // clear error when time selected
  };

  const onAddressSelect = (address: IAddress | null) => {
    setSelectedAddress(address);
    setAddressError(false); // clear error when address selected
  };

  const bookSlot = async () => {
    let hasError = false;

    if (!selectedAddress && showAddressSelector) {
      setAddressError(true);
      toast({
        title: "Error booking slot",
        description: "Please select an address",
        variant: "destructive",
      });
      hasError = true;
    } else {
      setAddressError(false);
    }

    if (!date) {
      setDateError(true);
      toast({
        title: "Error booking slot",
        description: "Please select a date",
        variant: "destructive",
      });
      hasError = true;
    } else {
      setDateError(false);
    }

    if (!timeSlot) {
      setTimeError(true);
      toast({
        title: "Error booking slot",
        description: "Please select a time slot",
        variant: "destructive",
      });
      hasError = true;
    } else {
      setTimeError(false);
    }

    if (hasError) return;

    setIsBooking(true);
    try {
      const formattedDate = formatDate(date!);
      console.log(orderDetails);
      await bookAppointmentApi({
        dateStr: formattedDate,
        time: timeSlot,
        orderId: orderDetails._id,
        notes: notes,
        addressId: selectedAddress?._id || null,
        impersonateUserId: orderDetails.profile,
      });
      onScheduleAppointment(date!, timeSlot, selectedAddress);
      navigate(`/order/${orderDetails._id}`);
    } catch (error) {
      const err = generateErrorMessage(error);
      toast({
        title: "Error booking slot",
        description: err || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-playfair font-bold">Book an Appointment</h3>
      <p className="text-neutral-charcoal/70">
        Schedule an appointment with our tailors for measurements and
        consultation.
      </p>

      {/* Address Selector */}
      {showAddressSelector && (
        <div
          className={cn(
            "mb-6",
            addressError && "border border-red-500 rounded-md p-2",
          )}
        >
          <AddressSelector
            onSelect={onAddressSelect}
            selectedAddressId={selectedAddress?._id}
            impersonateUserId={orderDetails?.profile}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date Selection */}
        <Card className={cn(dateError && "border-red-500 border-2")}>
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
              selected={date}
              onSelect={onDateSelect}
              disabled={disabledDays}
              className="rounded-md border pointer-events-auto w-max"
            />
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card className={cn(timeError && "border-red-500 border-2")}>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Clock className="mr-2 h-5 w-5" /> Select Time
            </CardTitle>
            <CardDescription>Choose an available time slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={timeSlot}
              onValueChange={onTimeSlotChange}
              disabled={!date || isLoadingSlots}
            >
              <SelectTrigger
                className={cn("w-full", timeError && "border-red-500 border-2")}
              >
                <SelectValue
                  placeholder={
                    isLoadingSlots
                      ? "Loading available slots..."
                      : !date
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
                      className={cn(
                        "cursor-pointer",
                        slot.remaining <= 0 &&
                          "text-red-500 cursor-not-allowed",
                        slot.remaining === 1 && "text-yellow-500",
                        slot.remaining >= 2 && "text-green-500",
                      )}
                      disabled={slot.remaining <= 0}
                    >
                      {slot.label}{" "}
                      {slot.remaining <= 0
                        ? "(Full)"
                        : `(${slot.remaining} left)`}
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isBooking}
              />
            </div>

            <div className="mt-8">
              <Button
                onClick={bookSlot}
                disabled={isBooking}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isBooking ? (
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

export default AppointmentScheduler;
