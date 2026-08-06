import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMale, FaFemale, FaGenderless } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateOTP } from "@/services/auth.api";
import { Gender } from "@/types/enums";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import { generateErrorMessage } from "@/lib/helpers";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { Slot } from "@/components/QuickOrderFlow";
import { useRouter } from "@/lib/next-router-compat";
import ScissorLoader from "@/components/ui/loader";

const SVG_TRANSITION_DURATION = 600;
const FORM_FADE_IN_DELAY = 300;

export default function Login() {
  const [step, setStep] = useState("phone");
  const [nextStep, setNextStep] = useState(null);
  const [transitionStage, setTransitionStage] = useState("idle");
  const [formVisible, setFormVisible] = useState(true);
  const [otpTimer, setOtpTimer] = useState(60);
  const [error, setError] = useState("");
  const navigate = useRouter();
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpId, setOtpId] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
 const router = useRouter();
  const searchParams = router.query;
  const setSearchParams = (params) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...params,
      },
    });
  };
  const info = router.query.info;

  const { customerLogin, createProfile, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      const bookAppointment = localStorage.getItem("bookAppointment");
      navigate(`/phone-call-schedule?catId=4`);
      // if (bookAppointment === "true") {
      //   localStorage.removeItem("bookAppointment");
      //   navigate(`/phone-call-schedule?catId=4`);
      // }

      // else {
      //   router.push("/profile");
      // }
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    countryCode: "+91",
    phone: "",
    otp: "",
    firstName: "",
    lastName: "",
    gender: "",
  });

  const otpRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === "otp" && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer, step]);

  useEffect(() => {
    if (transitionStage === "exiting" && nextStep) {
      setFormVisible(false);
      const timeout = setTimeout(() => {
        setStep(nextStep);
        setNextStep(null);
        setOtpTimer(nextStep === "otp" ? 60 : otpTimer);
        setTransitionStage("entering");
        setFormVisible(true);
      }, SVG_TRANSITION_DURATION + 100);
      return () => clearTimeout(timeout);
    }
  }, [transitionStage, nextStep]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const playTransition = (targetStep) => {
    setError("");
    setNextStep(targetStep);
    setTransitionStage("exiting");
  };

  // generate otp
  const handllePhoneStep = async () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setOtpLoading(true);
    try {
      const { message, status, otpId } = await generateOTP(formData.phone);
      if (status == true && otpId) {
        setOtpId(otpId);
        playTransition("otp");
        setSearchParams({ step: "otp" });
      }
    } catch (error: any) {
      setError(generateErrorMessage(error));
    } finally {
      setOtpLoading(false);
    }
  };

  // verify otp
  const handleOtpStep = async () => {
    const otp = formData.otp;
    if (otp.length !== 4) {
      setError("Please enter a 4-digit OTP.");
      return;
    }

    setOtpLoading(true);

    try {
      const { status, message, registrationToken, user, newUser } =
        await customerLogin(otpId, otp);
      if (status == true) {
        if (registrationToken) {
          setRegistrationToken(registrationToken);
        }
        const bookAppointment = localStorage.getItem("bookAppointment");
        if (bookAppointment === "true" && !newUser) {
          localStorage.removeItem("bookAppointment");
          navigate(`/phone-call-schedule?catId=4`);
        } else {
          playTransition("profile");
          setSearchParams({ step: "profile" });
        }
      } else {
        setError(message);
      }
    } catch (error: any) {
      const err = error.message;
      setError(err);
    } finally {
      setOtpLoading(false);
    }
  };

  // resend otp
  const handleResendOtp = async () => {
    if (!otpId) {
      setError("No registration token found.");
      return;
    }
    setOtpLoading(true);
    setError("");
    try {
      const { message, status, otpId } = await generateOTP(formData.phone);
      if (status == true) {
        setOtpId(otpId);
        setOtpTimer(60);
        toast({
          title: "OTP Resent",
          description: message || "A new OTP has been sent to your phone.",
          variant: "default",
        });
      }
    } catch (error: any) {
      setError(generateErrorMessage(error));
    } finally {
      setOtpLoading(false);
    }
  };

  // create user profile
  const handleProfileStep = async () => {
    if (!formData.firstName || !formData.gender) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const { message, status } = await createProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        registrationToken: registrationToken,
        gender: formData.gender,
      });

      if (status == true) {
        toast({
          title: "Welcome to SilaiGo!",
          description: "Profile created successfully.",
          variant: "default",
        });

        // Navigate to phone call schedule if bookAppointment param is true
        const bookAppointment = localStorage.getItem("bookAppointment");
        if (bookAppointment === "true") {
          localStorage.removeItem("bookAppointment");
          navigate(`/phone-call-schedule?catId=4`);
        }
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleNext = async () => {
    setError("");
    if (step === "phone") {
      handllePhoneStep();
    } else if (step === "otp") {
      handleOtpStep();
    } else if (step === "profile") {
      handleProfileStep();
    }
  };

  const titles = {
    phone: {
      title: "Welcome to SilaiGo!",
      subtitle:
        "Share your WhatsApp number to connect with our tailoring expert.",
    },
    otp: {
      title: "Enter Your OTP",
      subtitle: `We've sent a 4-digit code to ${formData.countryCode} ${formData.phone}`,
    },
    profile: {
      title: "Just One More Step!",
      subtitle: "Tell us a bit about yourself to complete your profile.",
    },
  };

  const renderFormContent = () => {
    switch (step) {
      case "phone":
        return (
          <div className="flex space-x-2">
            <input
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              className="w-20 px-3 py-2 border rounded-md"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone number"
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
        );
      case "otp":
        return (
          <>
            <OTPInput
              maxLength={4}
              value={formData.otp}
              inputMode="numeric"
              onChange={(otp) => {
                setFormData({ ...formData, otp });
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

            <div className="text-sm text-gray-600 text-center mt-2">
              {otpTimer > 0 ? (
                <>Resend OTP in {otpTimer}s</>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-[#01798d] underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        );
      case "profile":
        return (
          <>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="w-full px-4 py-2 border rounded-md mt-3"
            />
            <div className="flex justify-between gap-2 mt-4">
              {[
                { label: "Male", Icon: FaMale, value: Gender.MALE },
                { label: "Female", Icon: FaFemale, value: Gender.FEMALE },
                { label: "Other", Icon: FaGenderless, value: Gender.OTHER },
              ].map(({ label, Icon, value }) => (
                <button
                  key={label}
                  onClick={() => setFormData({ ...formData, gender: value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md border text-sm font-medium transition-all ${
                    formData.gender === value
                      ? "bg-[#01798d] text-white"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <>
      {otpLoading && step === "otp" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95">
          <ScissorLoader />
        </div>
      )}

      {/* Mobile View */}
      <div className="md:hidden min-h-screen flex flex-col relative bg-white overflow-hidden">
        <MetaTagsProvider
          title="Login | SilaiGo"
          description="Login to your SilaiGo account to manage your orders."
          canonicalPath="/login"
          noindex={true}
        />
        <motion.img
          src="/wave.svg"
          alt="Wave Background"
          initial={false}
          animate={{ y: transitionStage === "exiting" ? "0%" : "-60%" }}
          transition={{
            duration: SVG_TRANSITION_DURATION / 1000,
            ease: "easeInOut",
          }}
          className="w-full h-full object-cover absolute top-0 left-0 z-0"
        />
        <div className="w-full max-w-md mx-auto px-6 py-[260px] z-10 relative">
          <AnimatePresence mode="wait">
            {formVisible && (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.4,
                  delay:
                    transitionStage === "entering"
                      ? FORM_FADE_IN_DELAY / 1000
                      : 0,
                }}
              >
                <div className="text-center mb-6 text-[#01798d]">
                  <h2 className="text-2xl lg:text-3xl font-semibold">
                    {titles[step].title}
                  </h2>
                  <p className="text-sm lg:text-base mt-1 text-gray-600">
                    {titles[step].subtitle}
                  </p>
                </div>

                {info && (
                  <p className="text-red-500 text-sm text-center mb-3">
                    {info}
                  </p>
                )}

                {error && (
                  <p className="text-red-500 text-sm text-center mb-3">
                    {error}
                  </p>
                )}

                {renderFormContent()}

                <button
                  onClick={handleNext}
                  className="w-full py-2 mt-5 text-white font-semibold bg-[#01798d] rounded-md hover:opacity-90"
                >
                  {otpLoading ? (
                    <p>Loading...</p>
                  ) : step === "phone" ? (
                    "Send OTP"
                  ) : step === "otp" ? (
                    "Verify OTP"
                  ) : (
                    "Finish"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="flex w-[90%] max-w-6xl h-[720px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
          {/* Left Panel - Image + Quote */}
          <div className="w-1/2 relative overflow-hidden">
            <img
              src="https://mytest0274.s3.eu-north-1.amazonaws.com/login-img.jpg"
              alt="Tailoring Mood"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-10">
              <h2 className="text-white text-left text-2xl font-bold leading-snug max-w-[80%]">
                Because the perfect fit is more than just a size
                <br />– it’s a feeling.
              </h2>
            </div>
          </div>

          {/* Right Panel - Form Card with SVG and Animation */}
          <div className="w-1/2 relative bg-white overflow-hidden">
            <motion.img
              src="/wave.svg"
              alt="Wave Background"
              initial={false}
              animate={{ y: transitionStage === "exiting" ? "0%" : "-60%" }}
              transition={{
                duration: SVG_TRANSITION_DURATION / 1000,
                ease: "easeInOut",
              }}
              className="w-full h-full object-cover absolute top-0 left-0 z-0"
            />
            <div className="w-full h-full flex items-center justify-center px-10 py-[400px] z-10 relative">
              <AnimatePresence mode="wait">
                {formVisible && (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.4,
                      delay:
                        transitionStage === "entering"
                          ? FORM_FADE_IN_DELAY / 1000
                          : 0,
                    }}
                    className="w-full max-w-sm"
                  >
                    <div className="text-center mb-6 text-[#01798d]">
                      <h2 className="text-2xl font-semibold">
                        {titles[step].title}
                      </h2>
                      <p className="text-sm mt-1 text-gray-600">
                        {titles[step].subtitle}
                      </p>
                    </div>

                    {info && (
                      <p className="text-red-500 text-sm text-center mb-3">
                        {info}
                      </p>
                    )}

                    {error && (
                      <p className="text-red-500 text-sm text-center mb-3">
                        {error}
                      </p>
                    )}

                    {renderFormContent()}

                    <button
                      onClick={handleNext}
                      className="w-full py-2 mt-5 text-white font-semibold bg-[#01798d] rounded-md hover:opacity-90"
                    >
                      {otpLoading ? (
                        <p>Loading...</p>
                      ) : step === "phone" ? (
                        "Send OTP"
                      ) : step === "otp" ? (
                        "Verify OTP"
                      ) : (
                        "Finish"
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
