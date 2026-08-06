import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import OrderSummary from "@/components/OrderSummary";
import { useAuth } from "../contexts/AuthContext";
import { useOrderFlow } from "../contexts/OrderFlowContext";
import { useToast } from "@/hooks/use-toast";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import DesignGrid from "@/components/DesignGrid";
import AppointmentScheduler from "@/components/customization/AppointmentScheduler";
import { ArrowLeftIcon } from "lucide-react";
import {
  SendOtpStep,
  VerifyOtpStep,
  CreateProfileStep,
} from "@/components/QuickOrderFlow";
import { useQuery } from "@tanstack/react-query";
import { getSubCategoryStyleDetails } from "@/services/modules/category.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { NOT_LOGGED_IN_STEPS } from "../contexts/OrderFlowContext";
import { useRouter } from "@/lib/next-router-compat";

export const CompactNavbar = ({ user }: { user: any }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useRouter();
  const { id } = useRouter().query;
  const cancelOrderJourney = () => {
    setOpenDialog(false);
    navigate(`/category/${id}`);
  };
  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm flex justify-between items-center h-12 sm:h-14 px-4">
        <div className="flex items-center">
          <button
            onClick={() => {
              setOpenDialog(true);
            }}
            className="mr-2 p-2 rounded hover:bg-gray-100"
          >
            <ArrowLeftIcon size={22} />
            <span className="sr-only">Back</span>
          </button>
          <span className="font-semibold text-sm sm:text-base">
            Order Details
          </span>
        </div>
      </nav>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to cancel your order?
          </DialogDescription>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDialog(false);
              }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                cancelOrderJourney();
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const CustomizationPage = () => {
  const {
    page,
    setPage,
    customizationSteps,
    currentStepType,
    isLoadingTypes,
    isErrorTypes,
    selectedCustomizations,
    setSelectedCustomizations,
    sendOtp,
    verifyOtp,
    createProfile,
    loginFlowData,
    isPlacingOrder,
    placeOrderWithCustomization,
    showScheduler,
    setShowScheduler,
    orderDetails,
    handleScheduleAppointment,
    setUploadedImageUrls,
    uplaodedImageUrls,
  } = useOrderFlow();

  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
 const router = useRouter();
  const searchParams = router.query;
  const setSearchParams = (params: Record<string, string>) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...params,
      },
    });
  };
  const { id: catId, styleId } = useRouter().query;
  // only for mobile
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMobileState = () => setIsMobile(mediaQuery.matches);
    updateMobileState();
    mediaQuery.addEventListener("change", updateMobileState);
    return () => mediaQuery.removeEventListener("change", updateMobileState);
  }, []);

  const handleSelectDesign = (design: any) => {
    setSelectedCustomizations((prev) => {
      // If design is already selected (by _id), remove it (toggle off)
      if (prev.some((d) => d._id === design._id)) {
        return prev.filter((d) => d._id !== design._id);
      }

      // Remove any existing design with the same type
      const filtered = prev.filter((d) => d.type !== design.type);

      // Add the new design
      return [...filtered, design];
    });
  };

  const handleRemoveCustomization = (id: string) => {
    setSelectedCustomizations((prev) => prev.filter((d) => d._id !== id));
  };

  const handleOrderPlaced = () => {
    setShowScheduler(true);
  };

  useEffect(() => {
    const pageParam = (searchParams as Record<string, string>)?.page || "1";
    setPage(parseInt(pageParam, 10) || 1);
  }, [searchParams, setPage]);

  const handlePageMove = (direction: number) => {
    let newPage = page + direction;

    if (newPage < 1) {
      return;
    } else if (newPage > customizationSteps.length) {
      newPage = 3;
    }
    if (NOT_LOGGED_IN_STEPS.includes(currentStepType)) {
      if (direction === 1) {
        switch (currentStepType) {
          case "Send OTP":
            sendOtp();
            return;
          case "Verify OTP":
            verifyOtp();
            return;
          case "Create Profile":
            createProfile();
            return;
        }
      } else if (direction === -1) {
        setPage(page - 1);
        return;
      }
    }

    setPage(newPage);
    setSearchParams({ page: newPage.toString() });
  };
  
  const handleLoginStepClick = () => {
    switch (currentStepType) {
      case "Send OTP":
        sendOtp();
        break;
      case "Verify OTP":
        verifyOtp();
        break;
      case "Create Profile":
        createProfile();
        break;
      default:
        handlePageMove(1);
    }
  };

  const getButtonText = () => {
    if (NOT_LOGGED_IN_STEPS.includes(currentStepType)) {
      switch (currentStepType) {
        case "Send OTP":
          return "Send OTP";
        case "Verify OTP":
          return "Verify OTP";
        case "Create Profile":
          return "Continue";
        default:
          return "Next";
      }
    }

    return page === customizationSteps.length ? "Place Order" : "Next";
  };

  const isButtonDisabled = () => {
    if (loginFlowData.loading || isPlacingOrder) {
      return true;
    }

    if (NOT_LOGGED_IN_STEPS.includes(currentStepType)) {
      return false;
    }

    if (user && selectedCustomizations.length > 0) {
      return false;
    }
  };

  const handleButtonClick = () => {
    if (NOT_LOGGED_IN_STEPS.includes(currentStepType)) {
      handleLoginStepClick();
    } else if (
      user &&
      (selectedCustomizations.length > 0 || uplaodedImageUrls.length > 0) &&
      page === customizationSteps.length
    ) {
      if (isMobile) {
        setShowSidebar(true);
      } else {
        placeOrderWithCustomization();
      }
    } else {
      handlePageMove(1);
    }
  };

  const renderLoginStep = () => {
    switch (currentStepType) {
      case "Send OTP":
        return <SendOtpStep />;
      case "Verify OTP":
        return <VerifyOtpStep />;
      case "Create Profile":
        return <CreateProfileStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-gray-50 absolute top-0 left-0 right-0 bottom-0">
      <MetaTagsProvider
        title="Customization | SilaiGo"
        description="Customize your clothing with SilaiGo. Choose from a wide range of designs and styles to create your perfect outfit."
        canonicalPath="/customize"
        noindex={true}
      />

      <CompactNavbar user={user} />

      {isLoadingTypes && (
        <div className="flex justify-center items-center py-8 text-lg">
          Loading customization steps...
        </div>
      )}
      {isErrorTypes && (
        <div className="flex justify-center items-center py-8 text-lg text-red-500">
          Failed to load customization steps.
        </div>
      )}
      {!isLoadingTypes && !isErrorTypes && (
        <>
          {showScheduler ? (
            <div className="container mx-auto py-8">
              <AppointmentScheduler
                onScheduleAppointment={handleScheduleAppointment}
                orderDetails={orderDetails}
              />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg bg-white flex-1">
              <div className="w-full md:w-3/4 h-full flex flex-col">
                <div className="p-2 flex-1 overflow-auto scrollbar-thin scrollbar-hide w-full pb-32 md:pb-0 z-10">
                  {currentStepType &&
                    !NOT_LOGGED_IN_STEPS.includes(currentStepType) && (
                      <DesignGrid
                        type={currentStepType}
                        onSelectDesign={handleSelectDesign}
                        setPage={setPage}
                        selectedCustomizations={selectedCustomizations}
                        onRemoveCustomization={handleRemoveCustomization}
                        setUploadedImageUrls={setUploadedImageUrls}
                        uploadedImages={uplaodedImageUrls}
                      />
                    )}
                  {NOT_LOGGED_IN_STEPS.includes(currentStepType) && (
                    <div className="w-full flex flex-col items-center justify-center py-12 px-4 overflow-auto">
                      {renderLoginStep()}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/4 flex flex-col px-4 py-2">
                <OrderSummary
                  onOrderPlaced={handleOrderPlaced}
                  setShowSidebar={setShowSidebar}
                  showSidebar={showSidebar}
                />

                {/* Desktop Navigation Buttons */}
                <div
                  className="hidden md:flex flex-col md:flex-row gap-2 w-full my-2"
                  style={{ display: showScheduler ? "none" : "flex" }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePageMove(-1)}
                    disabled={
                      page === 1 || loginFlowData.loading || isPlacingOrder
                    }
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleButtonClick}
                    disabled={isButtonDisabled()}
                  >
                    {loginFlowData.loading || isPlacingOrder ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {getButtonText()}
                      </div>
                    ) : (
                      getButtonText()
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Buttons - Fixed at bottom */}
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40"
            style={{ display: showScheduler || !isMobile ? "none" : "flex" }}
          >
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handlePageMove(-1)}
                disabled={page === 1 || loginFlowData.loading || isPlacingOrder}
              >
                Back
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleButtonClick}
                disabled={isButtonDisabled()}
              >
                {loginFlowData.loading || isPlacingOrder ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {getButtonText()}
                  </div>
                ) : (
                  getButtonText()
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomizationPage;
