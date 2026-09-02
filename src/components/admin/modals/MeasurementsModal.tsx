"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { tailoringDetails } from "@/services/constants";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  listMeasurementCategories,
  listUserBodyMeasurement,
} from "@/services/modules/measurement-category.api";
import type { IMeasurementCategory } from "@/types/interface";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/lib/next-router-compat";

interface TailoringFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    optionsData: {
      category: string;
      details: Record<string, Record<string, string>>;
    };
    bodyMeasurement: {
      category: string;
      details: Record<string, string>;
    };
  }) => void;
  isUpdaing: boolean;
  initialData: {
    optionsData?: Record<string, Record<string, string>>;
    bodyMeasurement?: Record<string, string>;
  };
}

export const MeasurementsModal: React.FC<TailoringFormModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isUpdaing,
  initialData,
}) => {
  // --- Tab 1 State (safe initialization) ---
  const initialOptionsData = initialData?.optionsData || {};
  const normalizedInitialFormValues1: Record<
    string,
    Record<string, string>
  > = {};

  Object.entries(initialOptionsData).forEach(([detailId, opts]) => {
    normalizedInitialFormValues1[detailId] = opts || {};
  });

  const [selectedCategory1, setSelectedCategory1] = useState<string>(
    initialOptionsData.category as unknown as string,
  );

  const [formValues1, setFormValues1] = useState<
    Record<string, Record<string, string>>
  >(normalizedInitialFormValues1);

  const [visibleFields1, setVisibleFields1] = useState<Set<string>>(
    new Set(Object.keys(normalizedInitialFormValues1)),
  );

  // --- Tab 2 State ---
  const [selectedCategory2, setSelectedCategory2] = useState<string>(
    initialData?.bodyMeasurement?.category || "",
  );
  const [formValues2, setFormValues2] = useState<Record<string, string>>(
    initialData.bodyMeasurement || {},
  );

  // --- API call for Tab 2 ---
  const { data, isLoading, isError } = useQuery<IMeasurementCategory[]>({
    queryKey: ["measurement-categories"],
    queryFn: () => listMeasurementCategories(),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const prefillBodyMeasurements = (cat) => {
    if (typeof window === "undefined") return;
    const existingData = JSON.parse(
      localStorage.getItem("session_body_measurements") || "null",
    );
    const category = data.find((c) => c.name === cat);

    if (category && existingData) {
      const prefilled = {};
      category.fields.forEach((field) => {
        if (existingData[field.id]) {
          prefilled[field.id] = existingData[field.id];
        }
      });
      setFormValues2(prefilled);
    }
  };

  const [phone, setPhone] = useState(() => {
    if (typeof window !== "undefined") {
      const storedPhone = localStorage.getItem("customerPhone");
      return storedPhone?.length === 10 ? storedPhone : "";
    }
    return "";
  });
  const {
    data: customerBodyMeasurementData,
    isLoading: isLoadingCustomerMeasurementData,
    isSuccess: userBodyMeasurementDataSuccess,
    isError: errorInCustomerMeasurmentData,
  } = useQuery<IMeasurementCategory[]>({
    queryKey: ["user-measurements", phone],
    queryFn: () => {
      return listUserBodyMeasurement(phone);
    },
    enabled: phone.length === 10 && Object.keys(formValues2).length === 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (userBodyMeasurementDataSuccess && selectedCategory2) {
      console.log(customerBodyMeasurementData);
      const category = data.find((c) => c.name === selectedCategory2);
      const existingData = (customerBodyMeasurementData as any).bodyMeasurement;

      if (category && existingData) {
        const prefilled = {};
        category.fields.forEach((field) => {
          if (existingData[field.id]) {
            prefilled[field.id] = existingData[field.id];
          }
        });
        setFormValues2(prefilled);
      }
    } else if (errorInCustomerMeasurmentData) {
      toast({
        description: "Measurment data not available/error occurred",
      });
    }
  }, [
    userBodyMeasurementDataSuccess,
    selectedCategory2,
    errorInCustomerMeasurmentData,
  ]);

  // --- Tab1 field change ---
  const handleFieldChange = (
    detailId: string,
    optionId: string,
    value: string,
  ) => {
    setFormValues1((prev) => ({
      ...prev,
      [detailId]: {
        ...prev[detailId],
        [optionId]: value,
      },
    }));
  };

  // --- Toggle checkbox for a detail ---
  const toggleFieldVisibility = (detailId: string) => {
    setVisibleFields1((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(detailId)) {
        newSet.delete(detailId);
        setFormValues1((prev) => {
          const { [detailId]: _, ...rest } = prev; // remove nested data
          return rest;
        });
      } else {
        newSet.add(detailId);
        setFormValues1((prev) => ({
          ...prev,
          [detailId]: prev[detailId] || {},
        }));
      }
      return newSet;
    });
  };

  const handleCancel = () => {
    setSelectedCategory1("");
    setSelectedCategory2("");
    setFormValues1({});
    setFormValues2({});
    setVisibleFields1(new Set());
    onOpenChange(false);
  };

  const handleSave = () => {
    onSubmit?.({
      optionsData: {
        category: selectedCategory1,
        details: formValues1,
      },
      bodyMeasurement: {
        category: selectedCategory2,
        details: formValues2,
      },
    });
  };

  const categoryOptions1 = Object.keys(tailoringDetails);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Tailoring Details</DialogTitle>
          <DialogDescription>
            Manage tailoring and body measurements.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="tab1" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="tab1">Tailoring Options</TabsTrigger>
            <TabsTrigger value="tab2">Body Measurements</TabsTrigger>
          </TabsList>

          {/* --- TAB 1 --- */}
          <TabsContent value="tab1" className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="categorySelect1"
                className="font-medium text-base"
              >
                Category
              </Label>
              <Select
                value={selectedCategory1}
                onValueChange={(value) => {
                  setSelectedCategory1(value);
                  setFormValues1({});
                  setVisibleFields1(new Set());
                }}
              >
                <SelectTrigger
                  id="categorySelect1"
                  className="bg-white border rounded-lg h-12"
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions1.map((key) => (
                    <SelectItem key={key} value={key}>
                      {tailoringDetails[key].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b pb-2">
                  {tailoringDetails[selectedCategory1].name}
                </h3>

                <div className="space-y-4">
                  {tailoringDetails[selectedCategory1].details.map((detail) => (
                    <div
                      key={detail.id}
                      className="border rounded-xl p-4 bg-gray-50 space-y-3 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <Label className="font-medium">{detail.name}</Label>
                        <input
                          type="checkbox"
                          id={`check1-${detail.id}`}
                          checked={visibleFields1.has(detail.id)}
                          onChange={() => toggleFieldVisibility(detail.id)}
                          className="w-5 h-5 accent-black"
                        />
                      </div>

                      {detail.id === "piping" && (
                        <Select
                          value={formValues1[detail.id]?.["piping_type"] || ""}
                          onValueChange={(value) => {
                            handleFieldChange(detail.id, "piping_type", value);
                          }}
                        >
                          <SelectTrigger className="bg-white border rounded-lg h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="Fabric /  फैब्रिक की लगेगी">
                              Fabric / फैब्रिक की लगेगी
                            </SelectItem>
                            <SelectItem value="Piping material /  गोल्डन, रोज़ गोल्ड, सिल्वर, ब्लैक, व्हाइट (कंपनी के फ़ैब्रिक की लगेगी)">
                              Piping material / गोल्डन, रोज़ गोल्ड, सिल्वर,
                              ब्लैक, व्हाइट (कंपनी के फ़ैब्रिक की लगेगी)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {detail.id === "zip" && (
                        <Select
                          value={formValues1[detail.id]?.["zip_type"] || ""}
                          onValueChange={(value) => {
                            handleFieldChange(detail.id, "zip_type", value);
                          }}
                        >
                          <SelectTrigger className="bg-white border rounded-lg h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="Zipper">Zipper</SelectItem>
                            <SelectItem value="Hooks">Hooks</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {visibleFields1.has(detail.id) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {detail.options && Array.isArray(detail.options) ? (
                            <>
                              {detail.options.map((opt) => (
                                <div key={opt.id} className="space-y-1">
                                  <Label htmlFor={opt.id}>{opt.name}</Label>
                                  <Input
                                    type={
                                      opt.type === "checkbox"
                                        ? "checkbox"
                                        : "text"
                                    }
                                    id={opt.id}
                                    placeholder={
                                      opt.type === "text"
                                        ? `Enter ${opt.name}`
                                        : undefined
                                    }
                                    checked={
                                      opt.type === "checkbox" &&
                                      (formValues1[detail.id]?.[opt.id] ===
                                        "yes" ||
                                        formValues1[detail.id]?.[opt.id] ===
                                        "y")
                                    }
                                    value={
                                      opt.type === "text"
                                        ? formValues1[detail.id]?.[opt.id] || ""
                                        : undefined
                                    }
                                    onChange={(e) => {
                                      if (opt.type === "checkbox") {
                                        handleFieldChange(
                                          detail.id,
                                          opt.id,
                                          e.target.checked ? "yes" : "no",
                                        );
                                      } else {
                                        handleFieldChange(
                                          detail.id,
                                          opt.id,
                                          e.target.value,
                                        );
                                      }
                                    }}
                                    className={
                                      opt.type === "checkbox"
                                        ? "h-5 w-5"
                                        : "h-10"
                                    }
                                  />
                                </div>
                              ))}
                              <div className="space-y-1">
                                <Label htmlFor={`${detail.id}-additional`}>
                                  Additional Notes
                                </Label>
                                <Input
                                  type="text"
                                  id={`${detail.id}-additional`}
                                  placeholder="Enter additional info"
                                  value={
                                    formValues1[detail.id]?.additional || ""
                                  }
                                  onChange={(e) =>
                                    handleFieldChange(
                                      detail.id,
                                      "additional",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10"
                                />
                              </div>
                            </>
                          ) : (
                            <Input
                              id={detail.id}
                              placeholder={`Enter ${detail.name}`}
                              value={formValues1[detail.id]?.[detail.id] || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  detail.id,
                                  detail.id,
                                  e.target.value,
                                )
                              }
                              className="h-10"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* --- TAB 2 --- */}
          <TabsContent value="tab2" className="mt-4">
            {isLoading && (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="animate-spin w-5 h-5" />
              </div>
            )}
            {isError && (
              <p className="text-red-500">
                Failed to load measurement categories
              </p>
            )}

            {!isLoading && data && (
              <div className="flex flex-col">
                <Button
                  className="self-end"
                  onClick={() => {
                    setFormValues2({});
                    localStorage.removeItem("customerPhone");
                    localStorage.removeItem("session_body_measurements");
                  }}
                >
                  Reset
                </Button>
                <div>
                  <div>
                    <Label htmlFor="categorySelect2">
                      Select Body Category
                    </Label>
                    <Select
                      value={selectedCategory2}
                      onValueChange={(value) => {
                        setSelectedCategory2(value);
                        setFormValues2({});
                        prefillBodyMeasurements(value);
                      }}
                    >
                      <SelectTrigger id="categorySelect2">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {data &&
                          data.map((cat) => (
                            <SelectItem key={cat.name} value={cat.name}>
                              {cat.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-2">
                    <Label htmlFor="phone" className="mt-2">
                      Enter Phone Number
                    </Label>
                    <Input
                      type="text"
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);

                        if (e.target.value.length === 10) {
                          localStorage.setItem("customerPhone", e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
                {isLoadingCustomerMeasurementData ? (
                  <p className="mt-2">
                    Loading existing measurment data if available...
                  </p>
                ) : (
                  selectedCategory2 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        {data.find((c) => c.name === selectedCategory2)?.label}
                      </h3>
                      <div className="grid gap-4">
                        {data
                          .find((c) => c.name === selectedCategory2)
                          ?.fields.map((field) => (
                            <div key={field.id} className="space-y-2">
                              <Label htmlFor={`field-${field.id}`}>
                                {field.name}
                              </Label>
                              <Input
                                id={`field-${field.id}`}
                                placeholder={`Enter ${field.name}`}
                                value={formValues2[field.id] || ""}
                                onChange={(e) =>
                                  setFormValues2((prev) => ({
                                    ...prev,
                                    [field.id]: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              (Object.keys(formValues1).length === 0 &&
                Object.keys(formValues2).length === 0) ||
              isUpdaing
            }
          >
            Save {isUpdaing && <Loader2 className="w-4 h-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const MeasurementsForm: React.FC<any> = ({ measurementState }) => {
  const { toast } = useToast();
  const {
    selectedCategory1,
    formValues1,
    visibleFields1,
    selectedCategory2,
    formValues2,
  } = measurementState.state;

  const {
    setSelectedCategory1,
    setFormValues1,
    setVisibleFields1,
    setSelectedCategory2,
    setFormValues2,
  } = measurementState.actions;

  // --- Tab 1 State ---
  const categoryOptions1 = Object.keys(tailoringDetails); // tailoring option dresses categories

  // --- API call for Tab 2 ---
  const { data, isLoading, isError } = useQuery<IMeasurementCategory[]>({
    queryKey: ["measurement-categories"],
    queryFn: () => listMeasurementCategories(),
    staleTime: 1000 * 60 * 5,
  });

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
  const [phone, setPhone] = useState(
    searchParams.phone || searchParams._phone || "",
  );

  useEffect(() => {
    const rawPhone1 = searchParams.phone;
    const phone1 = Array.isArray(rawPhone1) ? rawPhone1[0] : rawPhone1;
    const rawPhone2 = searchParams._phone;
    const phone2 = Array.isArray(rawPhone2) ? rawPhone2[0] : rawPhone2;

    if (phone1) {
      setPhone(phone1);
    } else if (phone2) {
      setPhone(phone2);
    }
  }, [searchParams.phone, searchParams._phone]);

  const prefillBodyMeasurements = (cat) => {
    if (typeof window === "undefined") return;
    const existingData = JSON.parse(
      localStorage.getItem("session_body_measurements") || "null",
    );
    const category = data.find((c) => c.name === cat);

    if (category && existingData) {
      const prefilled = {};
      category.fields.forEach((field) => {
        if (existingData[field.id]) {
          prefilled[field.id] = existingData[field.id];
        }
      });
      setFormValues2(prefilled);
    }
  };

  const {
    data: customerBodyMeasurementData,
    isLoading: isLoadingCustomerMeasurementData,
    isSuccess: userBodyMeasurementDataSuccess,
    isError: errorInCustomerMeasurmentData,
    refetch: refetchMeasurementData,
  } = useQuery<IMeasurementCategory[]>({
    queryKey: ["user-measurements", phone],
    queryFn: () => {
      return listUserBodyMeasurement(phone);
    },
    enabled: phone.length === 10 && Object.keys(formValues2).length === 0,
  });

  useEffect(() => {
    // prefill common fields from db , if user have placed order in past
    if (userBodyMeasurementDataSuccess && selectedCategory2) {
      const category = data.find((c) => c.name === selectedCategory2);
      const existingData = (customerBodyMeasurementData as any).bodyMeasurement;

      if (category && existingData) {
        const prefilled = {};
        category.fields.forEach((field) => {
          if (existingData[field.id]) {
            prefilled[field.id] = existingData[field.id];
          }
        });
        setFormValues2(prefilled);
      }
    } else if (errorInCustomerMeasurmentData) {
      toast({
        description: "Measurment data not available/error occurred",
      });
    }
  }, [
    userBodyMeasurementDataSuccess,
    selectedCategory2,
    errorInCustomerMeasurmentData,
  ]);

  // --- Tab1 field change ---
  const handleFieldChange = (
    detailId: string,
    optionId: string,
    value: string,
  ) => {
    setFormValues1((prev) => ({
      ...prev,
      [detailId]: {
        ...prev[detailId],
        [optionId]: value,
      },
    }));
  };

  // --- Toggle checkbox for a detail ---
  const toggleFieldVisibility = (detailId: string) => {
    setVisibleFields1((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(detailId)) {
        newSet.delete(detailId);
        setFormValues1((prev) => {
          const { [detailId]: _, ...rest } = prev; // remove nested data
          return rest;
        });
      } else {
        newSet.add(detailId);
        setFormValues1((prev) => ({
          ...prev,
          [detailId]: prev[detailId] || {},
        }));
      }
      return newSet;
    });
  };

  return (
    <div className="overflow-y-auto">
      <div>
        <h4>Add Tailoring Details</h4>
        <p>Manage tailoring and body measurements.</p>
      </div>

      <Tabs defaultValue="tab1" className="mt-4">
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2 mb-2">
          <TabsTrigger value="tab1">Tailoring Options</TabsTrigger>
          <TabsTrigger value="tab2">Body Measurements</TabsTrigger>
        </TabsList>

        {/* --- TAB 1 --- */}
        <TabsContent value="tab1" className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="categorySelect1" className="font-medium text-base">
              Category
            </Label>
            <Select
              value={selectedCategory1}
              onValueChange={(value) => {
                setSelectedCategory1(value);
                setFormValues1({});
                setVisibleFields1(new Set());
              }}
            >
              <SelectTrigger
                id="categorySelect1"
                className="bg-white border rounded-lg h-12"
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions1.map((key) => (
                  <SelectItem key={key} value={key}>
                    {tailoringDetails[key].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">
                {tailoringDetails[selectedCategory1].name}
              </h3>

              <div className="space-y-4">
                {tailoringDetails[selectedCategory1].details.map((detail) => (
                  <div
                    key={detail.id}
                    className="border rounded-xl p-4 bg-gray-50 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">{detail.name}</Label>
                      <input
                        type="checkbox"
                        id={`check1-${detail.id}`}
                        checked={visibleFields1.has(detail.id)}
                        onChange={() => toggleFieldVisibility(detail.id)}
                        className="w-5 h-5 accent-black"
                      />
                    </div>

                    {detail.id === "piping" && (
                      <Select
                        value={formValues1[detail.id]?.["piping_type"] || ""}
                        onValueChange={(value) => {
                          handleFieldChange(detail.id, "piping_type", value);
                        }}
                      >
                        <SelectTrigger className="bg-white border rounded-lg h-10">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Fabric /  फैब्रिक की लगेगी">
                            Fabric / फैब्रिक की लगेगी
                          </SelectItem>
                          <SelectItem value="Piping material /  गोल्डन, रोज़ गोल्ड, सिल्वर, ब्लैक, व्हाइट (कंपनी के फ़ैब्रिक की लगेगी)">
                            Piping material / गोल्डन, रोज़ गोल्ड, सिल्वर, ब्लैक,
                            व्हाइट (कंपनी के फ़ैब्रिक की लगेगी)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {detail.id === "zip" && (
                      <Select
                        value={formValues1[detail.id]?.["zip_type"] || ""}
                        onValueChange={(value) => {
                          handleFieldChange(detail.id, "zip_type", value);
                        }}
                      >
                        <SelectTrigger className="bg-white border rounded-lg h-10">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Zipper">Zipper</SelectItem>
                          <SelectItem value="Hooks">Hooks</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {visibleFields1.has(detail.id) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {detail.options && Array.isArray(detail.options) ? (
                          <>
                            {detail.options.map((opt) => (
                              <div key={opt.id} className="space-y-1">
                                <Label htmlFor={opt.id}>{opt.name}</Label>
                                <Input
                                  type={
                                    opt.type === "checkbox"
                                      ? "checkbox"
                                      : "text"
                                  }
                                  id={opt.id}
                                  placeholder={
                                    opt.type === "text"
                                      ? `Enter ${opt.name}`
                                      : undefined
                                  }
                                  checked={
                                    opt.type === "checkbox" &&
                                    (formValues1[detail.id]?.[opt.id] ===
                                      "yes" ||
                                      formValues1[detail.id]?.[opt.id] === "y")
                                  }
                                  value={
                                    opt.type === "text"
                                      ? formValues1[detail.id]?.[opt.id] || ""
                                      : undefined
                                  }
                                  onChange={(e) => {
                                    if (opt.type === "checkbox") {
                                      handleFieldChange(
                                        detail.id,
                                        opt.id,
                                        e.target.checked ? "yes" : "no",
                                      );
                                    } else {
                                      handleFieldChange(
                                        detail.id,
                                        opt.id,
                                        e.target.value,
                                      );
                                    }
                                  }}
                                  className={
                                    opt.type === "checkbox" ? "h-5 w-5" : "h-10"
                                  }
                                />
                              </div>
                            ))}
                            <div className="space-y-1">
                              <Label htmlFor={`${detail.id}-additional`}>
                                Additional Notes
                              </Label>
                              <Input
                                type="text"
                                id={`${detail.id}-additional`}
                                placeholder="Enter additional info"
                                value={formValues1[detail.id]?.additional || ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    detail.id,
                                    "additional",
                                    e.target.value,
                                  )
                                }
                                className="h-10"
                              />
                            </div>
                          </>
                        ) : (
                          <Input
                            id={detail.id}
                            placeholder={`Enter ${detail.name}`}
                            value={formValues1[detail.id]?.[detail.id] || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                detail.id,
                                detail.id,
                                e.target.value,
                              )
                            }
                            className="h-10"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* --- TAB 2 --- */}
        <TabsContent value="tab2" className="mt-4">
          {isLoading && (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="animate-spin w-5 h-5" />
            </div>
          )}
          {isError && (
            <p className="text-red-500">
              Failed to load measurement categories
            </p>
          )}

          {!isLoading && data && (
            <div className="flex flex-col">
              <Button
                className="self-end"
                onClick={() => {
                  setFormValues2({});
                  localStorage.removeItem("customerPhone");
                  localStorage.removeItem("session_body_measurements");
                }}
              >
                Reset
              </Button>
              <div>
                <div className="mt-2">
                  <Label htmlFor="phone" className="mt-2">
                    Enter Phone Number
                  </Label>
                  <Input
                    type="text"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);

                      if (e.target.value.length === 10) {
                        setSelectedCategory2("");
                        setFormValues2({});
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set("phone", e.target.value);
                        setSearchParams(newParams);
                        refetchMeasurementData();
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="categorySelect2">Select Body Category</Label>
                  <Select
                    value={selectedCategory2}
                    onValueChange={(value) => {
                      setSelectedCategory2(value);
                      setFormValues2({});
                      prefillBodyMeasurements(value);
                    }}
                  >
                    <SelectTrigger id="categorySelect2">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {data &&
                        data.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            {cat.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {isLoadingCustomerMeasurementData ? (
                <p className="mt-2">
                  Loading existing measurment data if available...
                </p>
              ) : (
                selectedCategory2 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                      {data.find((c) => c.name === selectedCategory2)?.label}
                    </h3>
                    <div className="grid gap-4">
                      {data
                        .find((c) => c.name === selectedCategory2)
                        ?.fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={`field-${field.id}`}>
                              {field.name}
                            </Label>
                            <Input
                              id={`field-${field.id}`}
                              placeholder={`Enter ${field.name}`}
                              value={formValues2[field.id] || ""}
                              onChange={(e) =>
                                setFormValues2((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
