"use client";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

interface CustomerDetailsFormProps {
  onBack: () => void;
  onSubmit: (data: CustomerFormData) => void;
  appointmentDate: Date;
  appointmentTime: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  specialInstructions: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  address: z.string().min(5, { message: "Please enter your full address." }),
  city: z.string().min(2, { message: "Please enter your city." }),
  state: z.string().min(2, { message: "Please enter your state." }),
  zipCode: z.string().min(5, { message: "Please enter a valid zip code." }),
  specialInstructions: z.string().optional(),
});

const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
  onBack,
  onSubmit,
  appointmentDate,
  appointmentTime,
}) => {
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      specialInstructions: "",
    },
  });

  const handleSendOtp = () => {
    const phone = form.getValues("phone");

    if (phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number to receive OTP.",
        variant: "destructive",
      });
      return;
    }

    // Simulate OTP sending (in a real app, this would call an API)
    toast({
      title: "OTP Sent",
      description: `A verification code has been sent to ${phone}. For this demo, use "123456"`,
    });

    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    // For demo purposes, accept "123456" as valid OTP
    if (otp === "123456") {
      setOtpVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified.",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: "The verification code is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    if (!otpVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Ensure all required fields mapped correctly and specialInstructions defaulted to empty string if undefined
    const formData: CustomerFormData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      specialInstructions: data.specialInstructions ?? "",
    };

    onSubmit(formData);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-playfair font-bold">Your Details</h3>

      <div className="bg-primary/5 p-4 rounded-lg mb-6">
        <h4 className="font-medium mb-2">Appointment Scheduled</h4>
        <p className="text-sm">Date: {formatDate(appointmentDate)}</p>
        <p className="text-sm">Time: {appointmentTime}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="flex gap-3">
                    <FormControl>
                      <Input
                        placeholder="Enter your phone number"
                        {...field}
                        disabled={otpVerified}
                      />
                    </FormControl>
                    {!otpVerified && (
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        variant="outline"
                        className="shrink-0"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {otpSent ? "Resend OTP" : "Send OTP"}
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {otpSent && !otpVerified && (
              <div className="space-y-4">
                <div>
                  <FormLabel>Verification Code</FormLabel>
                  <div className="flex gap-3 mt-1.5">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((slot, index) => (
                            <InputOTPSlot key={index} {...slot} index={index} />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="shrink-0 bg-primary hover:bg-primary/90"
                    >
                      Verify
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Zip Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="specialInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requests or notes for your order"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointment
            </Button>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!otpVerified}
            >
              Submit Order <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CustomerDetailsForm;
