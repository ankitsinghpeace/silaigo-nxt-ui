"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getCustomersList,
  deleteCustomers,
  AdminEditCustomer,
  editCustomer,
  addUserByadmin,
} from "@/services/auth.api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Gender, PermissionSubType, PermissionType } from "@/types/enums";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarIcon, EditIcon, Loader2, Plus } from "lucide-react";
import { generateErrorMessage } from "@/lib/helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";
import { json2csv } from "json-2-csv";
import { FaFileInvoice, FaFirstOrder } from "react-icons/fa";
import { InvoiceGeneratorDialog } from "@/components/admin/InvoiceGenerator";
import { downloadInvoicePDF } from "@/lib/downloadInvoicePdf";
import { CreatePickupDialog } from "@/components/admin/CreatePickupDialog";
import { colorCodeArray } from "@/services/constants";
import { useRouter } from "@/lib/next-router-compat";

const SEARCH_FIELDS = [
  { value: "search", label: "Name/Email/Phone/Notes/General" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "referredBy", label: "Referred By" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const LIMIT_OPTIONS = [
  { value: "20", label: "20" },
  { value: "30", label: "30" },
  { value: "40", label: "40" },
  { value: "50", label: "50" },
];

const HAS_REFERRAL_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const GENDER_OPTIONS = [
  { value: "any", label: "Any" },
  { value: Gender.MALE, label: "Male" },
  { value: Gender.FEMALE, label: "Female" },
];

function generateInvoiceNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `INV-${datePart}-${randomPart}`;
}

const CustomersPage = () => {
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
  const [searchField, setSearchField] = useState(SEARCH_FIELDS[0].value);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<any>([]);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] =
    useState<AdminEditCustomer | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const canEdit = user?.permissions?.includes(
    `${PermissionType.CUSTOMERS}.${PermissionSubType.EDIT}`,
  );
  const canDelete = user?.permissions?.includes(
    `${PermissionType.CUSTOMERS}.${PermissionSubType.DELETE}`,
  );
  const canAdd = user?.permissions?.includes(
    `${PermissionType.CUSTOMERS}.${PermissionSubType.CREATE}`,
  );

  // Get active filters directly from searchParams
  const activeFilters = SEARCH_FIELDS.filter((field) =>
    searchParams[field.value],
  ).map((field) => ({
    field: field.value,
    value: searchParams[field.value]!,
    label: field.label,
  }));

  const handleSearch = () => {
    if (!searchValue.trim()) return;

    setSearchParams({
      [searchField]: searchValue,
      page: "1",
    });
    setSearchValue("");
  };

  const removeParam = (field: string) => {
    const newQuery = { ...router.query };
    delete newQuery[field];
    newQuery.page = "1";
    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const clearAllFilters = () => {
    const newQuery: Record<string, string> = { page: "1" };
    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const handlePagination = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const {
    data,
    isPending,
    isError,
    error: fetchError,
    refetch: refetchCustomerList,
  } = useQuery({
    queryKey: ["customers", searchParams.toString()],
    queryFn: () => getCustomersList(searchParams.toString()),
  });

  let customers = data?.customers || [];
  const pagination = data?.pagination;

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((customerId) => customerId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c.userId));
    }
  };

  const {
    mutate: deleteCustomersMutation,
    isPending: isDeletingCustomers,
    isError: isDeletingError,
    error: deletingError,
  } = useMutation({
    mutationFn: (customerIds: string[]) => {
      if (customerIds.length === 0) {
        toast({
          title: "No customers selected",
          description: "Please select at least one customer to delete",
          variant: "destructive",
        });
        return Promise.reject(new Error("No customers selected"));
      }
      return deleteCustomers(customerIds);
    },
    onSuccess: () => {
      refetchCustomerList();
      toast({
        title: "Customers deleted",
        description: "Customers have been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const {
    mutateAsync: addCustomerMutation,
    isPending: isSavingCustomer,
    error: isSavingCustomerError,
  } = useMutation({
    mutationFn: (customerData: {
      phone: string;
      firstName: string;
      lastName: string;
      gender?: Gender;
      colorCode?: string;
    }) => {
      return addUserByadmin(customerData);
    },
    onSuccess: (res: any) => {
      refetchCustomerList();
      toast({
        title: "Customer Added",
        description: "Customer has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const {
    mutate: editCustomerMutation,
    isPending: isEditingCustomer,
    isError: isEditingError,
    error: editingError,
  } = useMutation({
    mutationFn: (customerData: AdminEditCustomer) => {
      if (!canEdit) {
        toast({
          title: "Error",
          description: "You don't have permission to edit customers",
          variant: "destructive",
        });
      }
      return editCustomer(selectedCustomerForEdit?.userId, customerData);
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      refetchCustomerList();
      toast({
        title: "Customer updated",
        description: "Customer has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const addCustomer = async () => {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title:
        '<h2 style="font-size:20px; font-weight:600; margin-bottom:4px;">Add New Customer</h2>',
      html: `
        <div style="text-align:left; font-size:14px; display:flex; flex-direction:column; gap:14px;">
          <div>
            <label style="display:block; margin-bottom:4px; font-weight:500;">Phone</label>
            <input id="swal-input-phone" class="swal2-input" placeholder="Enter phone" style="width:100%; margin:0;" />
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; font-weight:500;">First Name</label>
            <input id="swal-input-firstname" class="swal2-input" placeholder="Enter first name" style="width:100%; margin:0;" />
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; font-weight:500;">Last Name</label>
            <input id="swal-input-lastname" class="swal2-input" placeholder="Enter last name" style="width:100%; margin:0;" />
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; font-weight:500;">Enter Notes(if any)</label>
            <input id="swal-input-notes" class="swal2-input" placeholder="Enter Notes(if any)" style="width:100%; margin:0;" />
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; font-weight:500;">Gender</label>
            <select id="swal-input-gender" class="swal2-input" style="width:100%; margin:0; padding:8px;">
              <option value="${Gender.MALE}">Male</option>
              <option value="${Gender.FEMALE}">Female</option>
              <option value="${Gender.OTHER}">Other</option>
              <option value="${Gender.NOT_SPECIFIED}">Not Specified</option>
            </select>

            <div style="display:flex; flex-direction:column; gap:4px;margin-top:10px;">
            <label style="display:block; margin-bottom:4px; font-weight:500;">Color Code</label>
            <select id="swal-input-colorcode" class="swal2-input" style="width:100%; margin:0; padding:8px;">
              ${colorCodeArray.map((color) => `<option value="${color}">${color}</option>`).join("")}
            </select>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      allowOutsideClick: () => !Swal.isLoading(),
      customClass: {
        popup: "rounded-xl shadow-md",
        confirmButton: "bg-teal-600 text-white px-4 py-2 rounded-lg",
        cancelButton: "bg-gray-200 text-gray-800 px-4 py-2 rounded-lg ml-2",
      },
      preConfirm: async () => {
        const payload: {
          phone: string;
          firstName: string;
          lastName: string;
          notes?: string;
          gender?: Gender;
          colorCode?: string;
        } = {
          phone: (
            document.getElementById("swal-input-phone") as HTMLInputElement
          ).value,
          firstName: (
            document.getElementById("swal-input-firstname") as HTMLInputElement
          ).value,
          lastName: (
            document.getElementById("swal-input-lastname") as HTMLInputElement
          ).value,
          notes: (
            document.getElementById("swal-input-notes") as HTMLInputElement
          ).value,
          gender: (
            document.getElementById("swal-input-gender") as HTMLSelectElement
          ).value as Gender,
          colorCode: (
            document.getElementById("swal-input-colorcode") as HTMLSelectElement
          ).value,
        };

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(payload.phone)) {
          Swal.showValidationMessage("Phone number must be exactly 10 digits");
          return false;
        }

        Swal.showLoading();

        try {
          const res = await addCustomerMutation(payload);
          return res;
        } catch (err: any) {
          Swal.showValidationMessage(err.message || "Failed to save customer");
          return false;
        }
      },
    });
  };

  async function fetchCustomersPage(
    page: number,
  ): Promise<{ orders: any[]; pagination: any }> {
    const startDate = searchParams.startDate;
    const endDate = searchParams.endDate;
    const query = new URLSearchParams();
    query.set("page", page.toString());

    if (startDate && endDate) {
      query.set("startDate", startDate);
      query.set("endDate", endDate);
    }
    const data = await getCustomersList(query.toString());
    return data;
  }

  const exportAllCustomersList = async () => {
    setIsExporting(true);
    let currentPage = 1;
    let allData: any[] = [];
    let hasNext = true;

    while (hasNext) {
      try {
        const data: any = await fetchCustomersPage(currentPage);
        allData = [...allData, ...(data.customers || [])];

        if (data.pagination?.hasNextPage) {
          currentPage = data.pagination.nextPage;
        } else {
          hasNext = false;
        }
      } catch (error) {
        console.error("Error fetching orders page:", error);
        hasNext = false;
      }
    }

    const options = {
      delimiter: {
        field: ",",
        wrap: '"',
        eol: "\n",
      },
      expandNestedObjects: true,
      expandArrayObjects: true,
      unwindArrays: true,
      useDateIso8601Format: true,
      escapeHeaderNestedDots: false,
      excludeKeys: [],
      checkSchemaDifferences: false,
      sortHeader: true,
      prependHeader: true,
      trimHeaderFields: true,
      trimFieldValues: true,
      preventCsvInjection: true,
    };

    try {
      const csv = await json2csv(allData, options);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "customers_export_silaigo.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
      alert("CSV generation failed:");
    }
    setIsExporting(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage and view customer information
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (!canAdd) {
                  toast({
                    title: "Error",
                    description: "You don't have permission to add customers",
                    variant: "destructive",
                  });
                  return;
                }
                addCustomer();
              }}
              disabled={!canAdd}
            >
              Add Customer
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-700"
              onClick={() => {
                if (!canDelete) {
                  toast({
                    title: "Error",
                    description:
                      "You don't have permission to delete customers",
                    variant: "destructive",
                  });
                  return;
                }
                deleteCustomersMutation(selectedCustomers);
              }}
              disabled={!canDelete}
            >
              Delete Selected Users ({selectedCustomers.length})
            </Button>
          </div>
        </div>

        {fetchError && (
          <div className="text-red-500 text-center">
            Error: {generateErrorMessage(fetchError)}
          </div>
        )}
        <div className="p-6 border border-dashed rounded-lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 mb-2 items-end">
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Gender
                </label>
                <Select
                  value={searchParams.gender || "any"}
                  onValueChange={(val) => {
                    if (val === "any") {
                      const newQuery = { ...router.query };
                      delete newQuery.gender;
                      newQuery.page = "1";
                      router.push({ pathname: router.pathname, query: newQuery });
                    } else {
                      setSearchParams({ gender: val, page: "1" });
                    }
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Sort By
                </label>
                <Select
                  value={searchParams.sortBy || "newest"}
                  onValueChange={(val) => {
                    setSearchParams({ sortBy: val, page: "1" });
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Limit
                </label>
                <Select
                  value={searchParams.limit || "20"}
                  onValueChange={(val) => {
                    setSearchParams({ limit: val, page: "1" });
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIMIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Has Referral
                </label>
                <Select
                  value={searchParams.hasReferral || "any"}
                  onValueChange={(val) => {
                    if (val === "any") {
                      const newQuery = { ...router.query };
                      delete newQuery.hasReferral;
                      newQuery.page = "1";
                      router.push({ pathname: router.pathname, query: newQuery });
                    } else {
                      setSearchParams({ hasReferral: val, page: "1" });
                    }
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Has Referral" />
                  </SelectTrigger>
                  <SelectContent>
                    {HAS_REFERRAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-55 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.startDate
                        ? format(
                            new Date(searchParams.startDate),
                            "PPP",
                          )
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        searchParams.startDate
                          ? new Date(searchParams.startDate)
                          : undefined
                      }
                      defaultMonth={
                        searchParams.startDate
                          ? new Date(searchParams.startDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setSearchParams({
                            startDate: format(date, "yyyy-MM-dd"),
                            page: "1",
                          });
                        } else {
                          const newQuery = { ...router.query };
                          delete newQuery.startDate;
                          newQuery.page = "1";
                          router.push({ pathname: router.pathname, query: newQuery });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-55 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.endDate
                        ? format(new Date(searchParams.endDate), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        searchParams.endDate
                          ? new Date(searchParams.endDate)
                          : undefined
                      }
                      defaultMonth={
                        searchParams.endDate
                          ? new Date(searchParams.endDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setSearchParams({
                            endDate: format(date, "yyyy-MM-dd"),
                            page: "1",
                          });
                        } else {
                          const newQuery = { ...router.query };
                          delete newQuery.endDate;
                          newQuery.page = "1";
                          router.push({ pathname: router.pathname, query: newQuery });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="button"
                onClick={exportAllCustomersList}
                disabled={isExporting}
              >
                Export To CSV{" "}
                {isExporting && <Loader2 className="animate-spin" />}
              </Button>
            </div>

            <div className="flex gap-2 w-full">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                className="flex-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={`Enter ${
                  SEARCH_FIELDS.find((f) => f.value === searchField)?.label ||
                  "value"
                }...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />

              <Button type="button" onClick={handleSearch}>
                Search
              </Button>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>

                {activeFilters.map((filter) => (
                  <span
                    key={filter.field}
                    className="flex items-center bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {filter.label}: {filter.value}
                    <button
                      type="button"
                      className="ml-1 hover:text-red-500 focus:outline-none"
                      onClick={() => removeParam(filter.field)}
                      aria-label={`Remove ${filter.field} filter`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 6L14 14M14 6L6 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Color Code Tabs */}
        <div className="w-full overflow-x-auto pb-2">
          <Tabs
            value={searchParams.colorCode || "uncategorized"}
            onValueChange={(value) => {
              if (value === "uncategorized") {
                const newQuery = { ...router.query };
                delete newQuery.colorCode;
                newQuery.page = "1";
                router.push({ pathname: router.pathname, query: newQuery });
              } else {
                setSearchParams({ colorCode: value, page: "1" });
              }
            }}
            className="w-full"
          >
            <TabsList className="flex h-auto w-max justify-start gap-1 p-1">
              <TabsTrigger value="uncategorized" className="px-4 py-2">
                Uncategorized
              </TabsTrigger>
              {colorCodeArray.map((color) => (
                <TabsTrigger
                  key={color}
                  value={color}
                  className="px-4 py-2 flex items-center gap-2 capitalize"
                >
                  <div
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                  {color}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Customer List Table */}
        <div className="p-6 border rounded-lg">
          {isPending && !isError ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : customers.length === 0 ? (
            <p className="text-muted-foreground text-center">
              No customers found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={
                          selectedCustomers.length === customers.length &&
                          customers.length > 0
                        }
                        onCheckedChange={handleSelectAllCustomers}
                      />
                    </div>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Color Code</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c: any) => {
                  const {
                    addressLine1 = "",
                    addressLine2 = "",
                    city = "",
                    state = "",
                    pincode = "",
                  } = c.address || {};

                  return (
                    <TableRow key={c.userId}>
                      <TableCell className="w-12">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={selectedCustomers.includes(c.userId)}
                            onCheckedChange={() => {
                              handleSelectCustomer(c.userId);
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.firstName} {c.lastName}
                      </TableCell>
                      <TableCell>{c.email || "-"}</TableCell>
                      <TableCell>{c.phone || "-"}</TableCell>
                      <TableCell>{c.gender || "-"}</TableCell>
                      <TableCell>
                        {`${addressLine1}, ${addressLine2}, ${city}, ${state}, ${pincode}` ||
                          "-"}
                      </TableCell>
                      <TableCell>{c.notes || "-"}</TableCell>
                      <TableCell>
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: c.colorCode }}
                        />
                      </TableCell>
                      <TableCell>
                        {c.createdAt
                          ? format(new Date(c.createdAt), "PPP hh:mm a")
                          : "-"}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          title="edit customer"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedCustomerForEdit(c);
                            setIsEditDialogOpen(true);
                          }}
                          disabled={!canEdit}
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Link href={`/admin/create-order?phone=${c.phone}`}>
                          <Button
                            title="create order"
                            variant="outline"
                            size="icon"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </Link>
                        <InvoiceGeneratorDialog
                          onSubmit={async (data) => {
                            const {
                              advance_collected,
                              extra_items,
                              ...customerData
                            } = data;
                            const invoiceCustomer = {
                              name: customerData.name ?? "",
                              addressLine1: customerData.addressLine1,
                              addressLine2: customerData.addressLine2 ?? "",
                              addressLine3: `${customerData.city} ${customerData.pincode}, ${customerData.state}`,
                              phone: data.phone,
                            };
                            const extraItemsTotal = extra_items.reduce(
                              (sum, item) => sum + item.unitCost * item.qty,
                              0,
                            );
                            const tax = extraItemsTotal * 0.05;
                            const invoice = {
                              customer: invoiceCustomer,
                              items: extra_items,
                              invoiceNo: generateInvoiceNumber(),
                              totals: {
                                subtotal: extraItemsTotal - tax,
                                tax: tax,
                                advance: advance_collected,
                                total: extraItemsTotal,
                              },
                              date: new Date().toLocaleDateString(),
                            };

                            await downloadInvoicePDF(invoice);
                          }}
                          initialData={{
                            name: `${c.firstName} ${c.lastName}`,
                            phone: c.phone,
                            addressLine1: addressLine1,
                            addressLine2: addressLine2,
                            city: city,
                            state: state,
                            pincode: pincode,
                          }}
                        />

                        <CreatePickupDialog
                          prefill={{
                            firstName: c.firstName,
                            lastName: c.lastName,
                            phone: c.phone,
                            addressLine1: addressLine1,
                            addressLine2: addressLine2,
                            city: city,
                            state: state,
                            pincode: pincode,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {pagination?.count || 0} of {pagination?.total || 0}{" "}
            customers
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                pagination?.prevPage && handlePagination(pagination.prevPage)
              }
              disabled={!pagination?.hasPrevPage}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {pagination?.currentPage || 1} of{" "}
              {pagination?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                pagination?.nextPage && handlePagination(pagination.nextPage)
              }
              disabled={!pagination?.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Edit the customer details</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName">First Name</label>
              <Input
                type="text"
                id="firstName"
                value={selectedCustomerForEdit?.firstName}
                onChange={(e) => {
                  setSelectedCustomerForEdit({
                    ...selectedCustomerForEdit,
                    firstName: e.target.value,
                  });
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="lastName">Last Name</label>
              <Input
                type="text"
                id="lastName"
                value={selectedCustomerForEdit?.lastName}
                onChange={(e) => {
                  setSelectedCustomerForEdit({
                    ...selectedCustomerForEdit,
                    lastName: e.target.value,
                  });
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="gender">Gender</label>
              <Select
                value={selectedCustomerForEdit?.gender}
                onValueChange={(value) => {
                  setSelectedCustomerForEdit({
                    ...selectedCustomerForEdit,
                    gender: value as Gender,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>Male</SelectItem>
                  <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="phone">Phone</label>
              <Input
                type="text"
                id="phone"
                value={selectedCustomerForEdit?.phone}
                onChange={(e) => {
                  setSelectedCustomerForEdit({
                    ...selectedCustomerForEdit,
                    phone: e.target.value,
                  });
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="notes">Notes</label>
              <Textarea
                id="notes"
                value={selectedCustomerForEdit?.notes}
                onChange={(e) => {
                  setSelectedCustomerForEdit({
                    ...selectedCustomerForEdit,
                    notes: e.target.value,
                  });
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="colorCode">Color Code</label>
              <Select
                value={selectedCustomerForEdit?.colorCode}
                onValueChange={(value) => {
                  setSelectedCustomerForEdit({
                    ...selectedCustomerForEdit,
                    colorCode: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Color Code" />
                </SelectTrigger>
                <SelectContent>
                  {colorCodeArray.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
              }}
              disabled={isEditingCustomer}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                editCustomerMutation(selectedCustomerForEdit!);
              }}
              disabled={isEditingCustomer}
            >
              Save{" "}
              {isEditingCustomer && (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CustomersPage;
