import React, { useRef, useEffect } from "react";
import { useOrderFlow } from "../contexts/OrderFlowContext";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Phone, User, CheckCircle } from "lucide-react";
import { Gender } from "@/types/enums";
import { generateOTP } from "@/services/auth.api";
import { OTPInput, SlotProps, REGEXP_ONLY_DIGITS } from "input-otp";

export function Slot(props: SlotProps) {
  return (
    <div
      className={`w-14 h-14 border-2 flex items-center justify-center rounded-md text-lg font-medium ${
        props.isActive ? "border-blue-500 bg-blue-100" : "border-gray-300"
      }`}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}

function StepperProgress({ step }: { step: number }) {
  return (
    <div className="w-full flex justify-center mb-8 px-4">
      <div className="relative flex items-center justify-between w-full max-w-sm">
        <div className="flex flex-col items-center flex-1 z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out border-2 ${
              step >= 1
                ? "bg-primary border-primary text-white scale-105"
                : "bg-white border-gray-300 text-gray-500"
            }`}
          >
            {step > 1 ? <CheckCircle size={18} /> : <Phone size={18} />}
          </div>
          <span
            className={`text-xs mt-2 font-semibold transition-colors duration-300 ${
              step >= 1 ? "text-primary" : "text-gray-600"
            }`}
          >
            Verification
          </span>
        </div>

        <div
          className={`absolute top-[20px] left-[25%] right-[25%] h-0.5 transition-all duration-500 ease-in-out ${
            step >= 2 ? "bg-primary" : "bg-gray-200"
          }`}
        ></div>

        <div className="flex flex-col items-center flex-1 z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out border-2 ${
              step === 2
                ? "bg-primary border-primary text-white scale-105"
                : "bg-white border-gray-300 text-gray-500"
            }`}
          >
            <User size={18} />
          </div>
          <span
            className={`text-xs mt-2 font-semibold transition-colors duration-300 ${
              step === 2 ? "text-primary" : "text-gray-600"
            }`}
          >
            Profile
          </span>
        </div>
      </div>
    </div>
  );
}

export function SendOtpStep() {
  const { loginFlowData, updateLoginFlowData } = useOrderFlow();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, "");
    updateLoginFlowData({ phone, error: "" });
  };

  return (
    <Card className="p-8 lg:p-12 shadow-2xl border border-gray-100 bg-white w-full max-w-lg mx-auto rounded-3xl">
      <StepperProgress step={1} />
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold font-playfair text-gray-900 mb-3">
          Please provide your phone number
        </h3>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
          We'll send a 4-digit code to securely verify your identity for the
          order.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base font-semibold">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 9876543210"
              value={loginFlowData.phone}
              onChange={handlePhoneChange}
              maxLength={10}
              disabled={loginFlowData.loading}
              className="h-12 text-base pl-16 border-gray-300 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all duration-200 rounded-xl"
            />
          </div>
        </div>

        {loginFlowData.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-sm text-red-600 animate-fade-in">
            {loginFlowData.error}
          </div>
        )}
      </div>
    </Card>
  );
}

export function VerifyOtpStep() {
  const { loginFlowData, updateLoginFlowData, verifyOtp } = useOrderFlow();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginFlowData.otpTimer > 0) {
      timer = setTimeout(() => {
        updateLoginFlowData({ otpTimer: loginFlowData.otpTimer - 1 });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [loginFlowData.otpTimer, updateLoginFlowData]);

  const handleResendOtp = async () => {
    if (!loginFlowData.otpId) {
      updateLoginFlowData({
        error: "No OTP session found. Please re-enter your phone number.",
      });
      return;
    }

    updateLoginFlowData({ loading: true, error: "" });
    try {
      const { status, otpId: newOtpId } = await generateOTP(
        loginFlowData.phone
      );
      if (status && newOtpId) {
        updateLoginFlowData({
          otpId: newOtpId,
          otpTimer: 60,
          otp: "",
          loading: false,
        });
        // Reset OTP inputs
        otpRefs.current.forEach((ref) => {
          if (ref) ref.value = "";
        });
      }
    } catch (error) {
      updateLoginFlowData({
        error: "Failed to resend OTP.",
        loading: false,
      });
    }
  };

  return (
    <Card className="p-8 lg:p-12 shadow-2xl border border-gray-100 bg-white w-full max-w-lg mx-auto rounded-3xl">
      <StepperProgress step={1} />
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold font-playfair text-gray-900 mb-3">
          Enter Your Verification Code
        </h3>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
          Please enter the 4-digit code sent to{" "}
          {loginFlowData.phone || "your phone number"} to proceed.
        </p>
      </div>

      <div className="space-y-7">
        <div className="space-y-2 flex flex-col gap-2 justify-center items-center">
          <label className="text-sm font-medium text-gray-700">
            Enter the 4-digit code
          </label>
          <OTPInput
            maxLength={4}
            value={loginFlowData.otp}
            inputMode="numeric"
            onChange={(otp) => {
              updateLoginFlowData({ otp });
            }}
            onComplete={() => {
              verifyOtp();
            }}
            pattern={REGEXP_ONLY_DIGITS}
            containerClassName="group flex items-center justify-center has-[:disabled]:opacity-30"
            render={({ slots }) => (
              <>
                <div className="flex gap-6">
                  {slots.map((slot, idx) => (
                    <Slot key={idx} {...slot} />
                  ))}
                </div>
              </>
            )}
          />
        </div>

        <div className="text-center">
          {loginFlowData.otpTimer > 0 ? (
            <p className="text-base text-gray-500">
              Resend code in{" "}
              <span className="font-semibold text-primary">
                {loginFlowData.otpTimer}s
              </span>
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              className="text-base text-primary hover:text-primary/80 underline font-medium transition-colors duration-200"
              disabled={loginFlowData.loading}
            >
              Resend verification code
            </button>
          )}
        </div>

        {loginFlowData.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-sm text-red-600 animate-fade-in">
            {loginFlowData.error}
          </div>
        )}
      </div>
    </Card>
  );
}

export function CreateProfileStep() {
  const { loginFlowData, updateLoginFlowData } = useOrderFlow();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateLoginFlowData({
      profile: { ...loginFlowData.profile, [name]: value },
      error: "",
    });
  };

  const handleGender = (gender: string) => {
    updateLoginFlowData({
      profile: { ...loginFlowData.profile, gender },
      error: "",
    });
  };

  return (
    <Card className="p-8 lg:p-12 shadow-2xl border border-gray-100 bg-white w-full max-w-lg mx-auto rounded-3xl">
      <StepperProgress step={2} />
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold font-playfair text-gray-900 mb-3">
          Almost There!
        </h3>
        <p className="text-base md:text-lg text-gray-600">
          Tell us a bit about yourself to personalize your experience.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="firstName"
            className="text-sm font-medium text-gray-700"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Your first name"
            value={loginFlowData.profile.firstName}
            onChange={handleChange}
            required
            className="h-12 text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all duration-200 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="lastName"
            className="text-sm font-medium text-gray-700"
          >
            Last Name (Optional)
          </label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Your last name"
            value={loginFlowData.profile.lastName}
            onChange={handleChange}
            className="h-12 text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all duration-200 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Male", value: Gender.MALE },
              { label: "Female", value: Gender.FEMALE },
              { label: "Other", value: Gender.OTHER },
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleGender(value)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  loginFlowData.profile.gender === value
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loginFlowData.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-sm text-red-600 animate-fade-in">
            {loginFlowData.error}
          </div>
        )}
      </div>
    </Card>
  );
}

function QuickOrderFlow() {
  const { currentStepType } = useOrderFlow();

  const renderStep = () => {
    switch (currentStepType) {
      case "Send OTP":
        return <SendOtpStep />;
      case "Verify OTP":
        return <VerifyOtpStep />;
      case "Create Profile":
        return <CreateProfileStep />;
      default:
        return <SendOtpStep />;
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 overflow-auto">
      {renderStep()}
    </div>
  );
}

export default QuickOrderFlow;
