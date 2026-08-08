import { createContext, useContext, useRef, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  getCustomizationTypesList,
  getSubCategoryStyleDetails,
} from "@/services/modules/category.api";
import { useQuery } from "@tanstack/react-query";
import { generateOTP, UserRole } from "@/services/auth.api";
import { useToast } from "@/hooks/use-toast";
import {
  getAndUpdateOrderId,
  placeAdminOrderApi,
  placeOrderApi,
} from "@/services/modules/orders.api";
import { generateErrorMessage } from "@/lib/helpers";
import { IOrder } from "@/types/interface";
import CategoryById from "@/page_components/CategoryById";
import Swal from "sweetalert2";
import { addToCart } from "@/lib/cart";
import { MeasurementsModal } from "@/components/admin/modals/MeasurementsModal";
import { useRouter } from "@/lib/next-router-compat";

export const SEND_OTP_STEP = "Send OTP";
export const VERIFY_OTP_STEP = "Verify OTP";
export const CREATE_PROFILE_STEP = "Create Profile";
export const NOT_LOGGED_IN_STEPS = [
  SEND_OTP_STEP,
  VERIFY_OTP_STEP,
  CREATE_PROFILE_STEP,
];

interface LoginFlowData {
  phone: string;
  otp: string;
  otpId: string;
  otpTimer: number;
  error: string;
  loading: boolean;
  registrationToken: string;
  profile: {
    firstName: string;
    lastName: string;
    gender: string;
  };
}

interface OrderFlowContextType {
  page: number;
  setPage: (page: number) => void;
  customizationSteps: string[];
  currentStepType: string;
  isLoadingTypes: boolean;
  isErrorTypes: boolean;

  selectedCustomizations: any[];
  setSelectedCustomizations: React.Dispatch<React.SetStateAction<any[]>>;
  selectedOption: any;
  setSelectedOption: React.Dispatch<React.SetStateAction<any>>;
  setUploadedImageUrls: React.Dispatch<React.SetStateAction<any[]>>;
  uplaodedImageUrls: string[];

  isPlacingOrder: boolean;
  orderType: string;
  orderDetails: IOrder | null;
  setOrderDetails: React.Dispatch<React.SetStateAction<IOrder | null>>;

  showScheduler: boolean;
  setShowScheduler: React.Dispatch<React.SetStateAction<boolean>>;

  loginFlowData: LoginFlowData;

  updateLoginFlowData: (data: Partial<LoginFlowData>) => void;
  sendOtp: () => Promise<void>;
  verifyOtp: () => Promise<void>;
  createProfile: () => Promise<void>;
  placeOrderWithCustomization: () => Promise<void>;

  handleScheduleAppointment: (date: Date, timeSlot: string) => void;

  handleLoginForScheduleCall: () => boolean;
  handleScheduleCallClick: () => Promise<void>;
  handleBookAppoinmentClicked: () => Promise<void>;
  addOrderDataToCart: (
    metaData: any,
    price: number,
    measurement: any,
  ) => Promise<void>;

  isMeasurementModalOpen: boolean;
  setIsMeasurementModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openSingleOrderMeasurementModal: () => void;
}

const OrderFlowContext = createContext<OrderFlowContextType | undefined>(
  undefined,
);

const OrderFlowProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();
  const subCatId = router.query.subCatId;
  const { styleId } = useRouter().query;
  const { id } = useRouter().query;
  const navigate = useRouter();

  //auth states
  const {
    user,
    customerLogin,
    createProfile: createProfileApi,
    isAuthenticated,
  } = useAuth();
  const [loginFlowData, setLoginFlowData] = useState<LoginFlowData>({
    phone: "",
    otp: "",
    otpId: "",
    otpTimer: 0,
    error: "",
    loading: false,
    registrationToken: "",
    profile: {
      firstName: "",
      lastName: "",
      gender: "",
    },
  });

  //order flow states
  const [page, setPage] = useState(1);
  const {
    data: customizationTypes,
    isLoading: isLoadingTypes,
    isError: isErrorTypes,
  } = useQuery<string[]>({
    queryKey: ["customization-types"],
    queryFn: getCustomizationTypesList,
    // only needed inside the customize/order flow
    enabled: Boolean(subCatId) || Boolean(styleId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const {
    data: subCategoryStyleDetails,
    isLoading: isSubCategoryStyleDetailsLoading,
  } = useQuery({
    queryKey: ["subCategoryStyleDetails", subCatId, styleId],
    queryFn: () => getSubCategoryStyleDetails(subCatId, styleId),
    enabled: Boolean(subCatId) && Boolean(styleId),
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Create customization steps without login steps if user is logged in
  const customizationSteps = Array.isArray(customizationTypes)
    ? [...customizationTypes, ...(user?.phone ? [] : NOT_LOGGED_IN_STEPS)]
    : [
        "Neck",
        "Collar",
        "Sleeves",
        ...(user?.phone ? [] : NOT_LOGGED_IN_STEPS),
      ];

  const currentStepType = customizationSteps[page - 1];

  //order data states
  const [selectedCustomizations, setSelectedCustomizations] = useState<any[]>(
    [],
  );
  const [selectedOption, setSelectedOption] = useState<any>([]);
  const [uplaodedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  // Order placement states
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderType, setOrderType] = useState("");
  const [orderDetails, setOrderDetails] = useState<IOrder | null>(null);

  // Scheduler states
  const [showScheduler, setShowScheduler] = useState(false);
  const [schedulingCallOnly, setSchedulingCallOnly] = useState(false);

  // measurements
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [singleOrderMeasurementModalOpen, setSingleOrderMeasurementModalOpen] =
    useState(false);

  useEffect(() => {
    if (user?.phone && page > customizationTypes?.length) {
      setPage(1);
    }
  }, [user, page, customizationTypes?.length]);

  // Login flow functions
  const updateLoginFlowData = (data: Partial<LoginFlowData>) => {
    setLoginFlowData((prev) => ({ ...prev, ...data }));
  };

  const sendOtp = async () => {
    if (!loginFlowData.phone || loginFlowData.phone.length !== 10) {
      updateLoginFlowData({
        error: "Please enter a valid 10-digit phone number.",
      });
      return;
    }

    updateLoginFlowData({ loading: true, error: "" });
    try {
      const { status, otpId: newOtpId } = await generateOTP(
        loginFlowData.phone,
      );
      if (status && newOtpId) {
        updateLoginFlowData({
          otpId: newOtpId,
          otpTimer: 60,
          loading: false,
        });
        toast({
          title: "OTP Sent!",
          description: "A 4-digit code has been sent to your phone.",
        });
        setPage(page + 1); // Move to OTP step
      } else {
        updateLoginFlowData({
          error: "Failed to send OTP. Please try again.",
          loading: false,
        });
      }
    } catch (error) {
      updateLoginFlowData({
        error: "Failed to send OTP. Please try again.",
        loading: false,
      });
    }
  };

  const verifyOtp = async () => {
    if (!loginFlowData.otp || loginFlowData.otp.length !== 4) {
      updateLoginFlowData({ error: "Please enter a valid 4-digit OTP." });
      return;
    }

    updateLoginFlowData({ loading: true, error: "" });
    try {
      const res = await customerLogin(
        loginFlowData.otpId,
        loginFlowData.otp,
        false,
      );
      if (res.status && res.user) {
        toast({
          title: "Login Successful!",
          description: "You are now logged in.",
        });
        updateLoginFlowData({ loading: false });
        // Move to first customization step after successful login
        setPage(3);
      } else if (res.status && res.newUser && res.registrationToken) {
        updateLoginFlowData({
          registrationToken: res.registrationToken,
          loading: false,
        });
        setPage(page + 1); // Move to profile creation
      } else {
        updateLoginFlowData({
          error: res.message || "Failed to verify OTP.",
          loading: false,
        });
      }
    } catch (error) {
      updateLoginFlowData({
        error: "Failed to verify OTP. Please try again.",
        loading: false,
      });
    }
  };

  const createProfile = async () => {
    if (!loginFlowData.profile.firstName || !loginFlowData.profile.gender) {
      updateLoginFlowData({
        error: "Please provide your first name and select your gender.",
      });
      return;
    }

    updateLoginFlowData({ loading: true, error: "" });
    try {
      const res = await createProfileApi(
        {
          phone: loginFlowData.phone,
          firstName: loginFlowData.profile.firstName,
          lastName: loginFlowData.profile.lastName,
          registrationToken: loginFlowData.registrationToken,
          gender: loginFlowData.profile.gender,
        },
        false,
      );

      if (res.status) {
        toast({
          title: "Profile Created!",
          description: "Your profile is ready. You can now place your order.",
        });
        updateLoginFlowData({ loading: false });
        // Move to first customization step after successful profile creation
        if (schedulingCallOnly) {
          handleScheduleCallClick();
        } else {
          setPage(3);
        }
      } else {
        updateLoginFlowData({
          error: res.message || "Failed to create profile.",
          loading: false,
        });
      }
    } catch (error) {
      updateLoginFlowData({
        error: "Failed to create profile. Please try again.",
        loading: false,
      });
    }
  };

  const handleLoginForScheduleCall = (): boolean => {
    if ((!user || !isAuthenticated) && !schedulingCallOnly) {
      const phonePageIndex = customizationSteps.indexOf(SEND_OTP_STEP);
      setPage(phonePageIndex + 1);
      setSchedulingCallOnly(true);
      return false;
    }
    return true;
  };

  // order place

  const openSingleOrderMeasurementModal = () => {
    setSingleOrderMeasurementModalOpen(true);
  };

  const placeAdminOrder = async (measurements) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      return;
    }

    if (user.role === UserRole.CUSTOMER) {
      toast({
        title: "Forbidden",
        description: "You are not authorized to perform this action",
        variant: "destructive",
      });
      return;
    }
    setOrderType("customizations");
    setSingleOrderMeasurementModalOpen(false);
    const customerDetails = await Swal.fire({
      title:
        '<h2 style="font-size:20px; font-weight:600; margin-bottom:4px;">Enter Customer Details</h2>',
      html: `
    <div style="text-align:left; font-size:14px; display:flex; flex-direction:column; gap:14px;">
      <div>
        <label style="display:block; margin-bottom:4px; font-weight:500;">Customer Name</label>
        <input id="swal-name" class="swal2-input" placeholder="Customer Name" required style="width:100%; margin:0;" />
      </div>
      <div>
        <label style="display:block; margin-bottom:4px; font-weight:500;">Customer Phone</label>
        <input id="swal-phone" class="swal2-input" placeholder="Customer Phone" type="string" minlength="10" required style="width:100%; margin:0;" value="${(typeof window !== "undefined" && localStorage.getItem("customerPhone")) || ""}"/>
      </div>
      <div>
        <label style="display:block; margin-bottom:4px; font-weight:500;">Custom Price (optional)</label>
        <input id="swal-price" class="swal2-input" placeholder="Custom Price (optional)" type="number" style="width:100%; margin:0;" />
      </div>
    </div>
  `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: (document.getElementById("swal-name") as HTMLInputElement)
            .value,
          phone: (document.getElementById("swal-phone") as HTMLInputElement)
            .value,
          price:
            (document.getElementById("swal-price") as HTMLInputElement).value ||
            null,
        };
      },
      confirmButtonText: "Save",
      showCancelButton: true,
      customClass: {
        popup: "rounded-xl shadow-md",
        confirmButton: "bg-teal-600 text-white px-4 py-2 rounded-lg",
        cancelButton: "bg-gray-200 text-gray-800 px-4 py-2 rounded-lg ml-2",
      },
    });

    if (!customerDetails.isConfirmed && !customerDetails.value) {
      toast({
        title: "Error",
        description: "Both customer phone and name are required",
        variant: "destructive",
      });
      setIsPlacingOrder(false);
      return;
    }

    const { phone, name, price } = customerDetails.value;
    if (!phone || !name) {
      toast({
        title: "Error",
        description: "Both customer phone and name are required",
        variant: "destructive",
      });
      setIsPlacingOrder(false);
      return;
    }

    setIsPlacingOrder(true);
    const orderId = await getAndUpdateOrderId(
      subCatId,
      subCategoryStyleDetails.name,
    );
    try {
      const orderData = {
        items: {
          orderId: orderId,
          customizations: selectedCustomizations.map((item) => {
            return { optionId: item._id, type: item.type };
          }),
          subCategory: subCatId,
          subCategoryStyleId: styleId,
          // options: selectedOption
          //   ? [
          //     {
          //       categoryId: subCategoryStyleDetails?.category?._id,
          //       optionId: selectedOption?._id,
          //     },
          //   ]
          //   : [],
          options: selectedOption.map((el) => {
            return {
              categoryId: subCategoryStyleDetails?.category?._id,
              optionId: el._id,
            };
          }),
        },
        imageUrls: uplaodedImageUrls,
        phone,
        name,
        customPrice: price,
        measurements,
      };

      const response = await placeAdminOrderApi(orderData);
      toast({
        title: "Order placed successfully",
        description: "Please select the appointment date and time",
      });

      setOrderDetails({
        _id: response._id,
        status: response.status,
        profile: response.profile,
      });

      // Reset customizations after successful order
      setSelectedCustomizations([]);

      // Show scheduler after successful order placement
      setShowScheduler(true);
    } catch (error) {
      const err = generateErrorMessage(error);
      toast({
        title: "Error",
        description: err || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
      setOrderType("");
    }

    localStorage.removeItem("customerPhone");
  };

  const placeOrderWithCustomization = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      return;
    }

    if (user.role != UserRole.CUSTOMER) {
      // placeAdminOrder();
      openSingleOrderMeasurementModal();
      return;
    }

    setIsPlacingOrder(true);
    setOrderType("customizations");

    const orderId = await getAndUpdateOrderId(
      subCatId,
      subCategoryStyleDetails.name,
    );
    try {
      const orderData = {
        items: {
          orderId: orderId,
          customizations: selectedCustomizations.map((item) => {
            return { optionId: item._id, type: item.type };
          }),
          subCategory: subCatId,
          subCategoryStyleId: styleId,
          // options: selectedOption
          //   ? [
          //     {
          //       categoryId: subCategoryStyleDetails?.category?._id,
          //       optionId: selectedOption?._id,
          //     },
          //   ]
          //   : [],
          options: selectedOption.map((el) => {
            return {
              categoryId: subCategoryStyleDetails?.category?._id,
              optionId: el._id,
            };
          }),
        },
        imageUrls: uplaodedImageUrls,
      };

      const response = await placeOrderApi(orderData);

      toast({
        title: "Order placed successfully",
        description: "Please select the appointment date and time",
      });

      setOrderDetails({
        _id: response._id,
        status: response.status,
      });

      // Reset customizations after successful order
      setSelectedCustomizations([]);

      // Show scheduler after successful order placement
      setShowScheduler(true);
    } catch (error) {
      const err = generateErrorMessage(error);
      toast({
        title: "Error",
        description: err || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
      setOrderType("");
    }
  };

  const handleScheduleCallClick = async () => {
    if (isPlacingOrder) return;
    if (!handleLoginForScheduleCall()) return;
    navigate(`/phone-call-schedule?catId=${id}`);
  };

  const handleBookAppoinmentClicked = async () => {
    if (!handleLoginForScheduleCall()) {
      if (typeof window !== "undefined") {
        localStorage.setItem("bookAppointment", "true");
      }
      router.push("/login");
    } else {
      return;
    }
  };

  const handleScheduleAppointment = (date: Date, timeSlot: string) => {
    setPage(customizationSteps.length);
    setSelectedCustomizations([]);
    setShowScheduler(false);
    toast({
      title: "Appointment Scheduled",
      description: `Your appointment is scheduled for ${date.toLocaleDateString()} at ${timeSlot}`,
    });
  };

  // order object + existing cart str => to be used for placing multiple order at atime
  const addOrderDataToCart = async (metaData, price, mesurement) => {
    const orderId = await getAndUpdateOrderId(
      subCatId,
      subCategoryStyleDetails.name,
    );

    if (mesurement?.bodyMeasurement) {
      const { category, ...restData } = mesurement.bodyMeasurement;
      if (typeof window !== "undefined") {
        const existingData =
          JSON.parse(
            localStorage.getItem("session_body_measurements") || "{}",
          ) || {};
        const updatedData = {
          ...existingData,
          ...restData,
        };
        localStorage.setItem(
          "session_body_measurements",
          JSON.stringify(updatedData),
        );
      }
    }
    const orderData = {
      items: {
        orderId: orderId,
        customizations: selectedCustomizations.map((item) => {
          return { optionId: item._id, type: item.type };
        }),
        subCategory: subCatId,
        subCategoryStyleId: styleId,
        // options: selectedOption
        //   ? [
        //     {
        //       categoryId: subCategoryStyleDetails?.category?._id,
        //       optionId: selectedOption?._id,
        //     },
        //   ]
        //   : [],
        options: selectedOption.map((el) => {
          return {
            categoryId: subCategoryStyleDetails?.category?._id,
            optionId: el._id,
          };
        }),
      },
      imageUrls: uplaodedImageUrls,
      customPrice: price,
      measurements: mesurement,
    };

    addToCart({ ...metaData, orderData });
  };

  const contextValue: OrderFlowContextType = {
    // Order flow states
    page,
    setPage,
    customizationSteps,
    currentStepType,
    isLoadingTypes,
    isErrorTypes,

    // Order data states
    selectedCustomizations,
    setSelectedCustomizations,
    selectedOption,
    setSelectedOption,
    setUploadedImageUrls,
    uplaodedImageUrls,

    // Order placement states
    isPlacingOrder,
    orderType,
    orderDetails,
    setOrderDetails,
    addOrderDataToCart,

    // Scheduler states
    showScheduler,
    setShowScheduler,

    // Login flow states
    loginFlowData,

    // Login flow functions
    updateLoginFlowData,
    sendOtp,
    verifyOtp,
    createProfile,

    // Order placement functions
    placeOrderWithCustomization,

    // Scheduler functions
    handleScheduleAppointment,

    // handle login for image upload and schedule call
    handleLoginForScheduleCall,
    handleScheduleCallClick,
    handleBookAppoinmentClicked,

    //measurement
    isMeasurementModalOpen,
    setIsMeasurementModalOpen,
    openSingleOrderMeasurementModal,
  };

  return (
    <OrderFlowContext.Provider value={contextValue}>
      {children}
      <MeasurementsModal
        isOpen={singleOrderMeasurementModalOpen}
        onOpenChange={setSingleOrderMeasurementModalOpen}
        onSubmit={async (data) => {
          const details = {
            optionsData: {
              category: data.optionsData?.category,
              ...data.optionsData?.details,
            },
            bodyMeasurement: {
              category: data.bodyMeasurement?.category,
              ...data.bodyMeasurement?.details,
            },
          };
          await placeAdminOrder(details);
        }}
        isUpdaing={false}
        initialData={{}}
        key={""}
      />
    </OrderFlowContext.Provider>
  );
};

const useOrderFlow = () => {
  const context = useContext(OrderFlowContext);
  if (!context) {
    throw new Error("useOrderFlow must be used within an OrderFlowProvider");
  }
  return context;
};

export { OrderFlowProvider, OrderFlowContext, useOrderFlow };
