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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Gender,
  OrderInitiationStatus,
  PermissionSubType,
  PermissionType,
  PhoneCallStatus,
} from "@/types/enums";
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
import { format } from "date-fns";
import { CalendarIcon, EditIcon, ExternalLink, Loader2 } from "lucide-react";
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
import {
  getScheduledCallsList,
  updateScheduledCallStatus,
} from "@/services/modules/phone-call-schedule.api";
import { useRouter } from "@/lib/next-router-compat";

const SEARCH_FIELDS = [
  { value: "customerPhone", label: "Phone" },
  { value: "categoryName", label: "Category Name" },
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

const CALL_STATUS_OPTIONS = [
  { value: "any", label: "Any" },
  { value: PhoneCallStatus.PENDING, label: "Pending" },
  { value: PhoneCallStatus.DONE, label: "Done" },
];

const ORDER_INITIATION_STATUS_OPTIONS = [
  { value: "any", label: "Any" },
  { value: OrderInitiationStatus.PENDING, label: "Pending" },
  { value: OrderInitiationStatus.DONE, label: "Done" },
];

const ScheduledCallsPage = () => {
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
  const queryString = new URLSearchParams(
    searchParams as Record<string, string>,
  ).toString();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // useEffect(() => {
  //   const newParams = new URLSearchParams(searchParams);

  //   newParams.set("appointmentDate", format(new Date(), "yyyy-MM-dd"));
  //   setSearchParams(newParams);
  // }, []);

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
    refetch: refetchCallsList,
  } = useQuery({
    queryKey: ["scheduled-calls", queryString],
    queryFn: () => getScheduledCallsList(searchParams),
  });

  const calls = data?.calls || [];
  const pagination = data?.pagination;

  const { mutate: updateScheduledCall, isPending: isUpdatingCall } =
    useMutation({
      mutationFn: async (call) => {
        return updateScheduledCallStatus(call);
      },
      onSuccess: (updatedCall) => {
        console.log(updatedCall);
        toast({
          title: "Success",
          description: "Call Status updated successfully",
        });

        queryClient.setQueryData(
          ["scheduled-calls", queryString],
          (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              calls: oldData.calls.map((call) =>
                call._id === updatedCall._id ? updatedCall : call,
              ),
            };
          },
        );
      },
      onError: (err) => {
        toast({
          title: "Error",
          description:
            generateErrorMessage(err) || "Call Status updtion failed",
          variant: "destructive",
        });
      },
    });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Scheduled Calls
            </h1>
            <p className="text-muted-foreground">
              Manage and view Scheduled Calls
            </p>
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
                  Call Status
                </label>
                <Select
                  value={searchParams.callStatus || "any"}
                  onValueChange={(val) => {
                    if (val === "any") {
                      const newQuery = { ...router.query };
                      delete newQuery.callStatus;
                      newQuery.page = "1";
                      router.push({ pathname: router.pathname, query: newQuery });
                    } else {
                      setSearchParams({ callStatus: val, page: "1" });
                    }
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Call status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_STATUS_OPTIONS.map((opt) => (
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
                  Order Status
                </label>
                <Select
                  value={searchParams.orderStatus || "any"}
                  onValueChange={(val) => {
                    if (val === "any") {
                      const newQuery = { ...router.query };
                      delete newQuery.orderStatus;
                      newQuery.page = "1";
                      router.push({ pathname: router.pathname, query: newQuery });
                    } else {
                      setSearchParams({ orderStatus: val, page: "1" });
                    }
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Order initiation status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_INITIATION_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Appointment Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-55 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.appointmentDate
                        ? format(
                            new Date(searchParams.appointmentDate),
                            "PPP",
                          )
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        searchParams.appointmentDate
                          ? new Date(searchParams.appointmentDate)
                          : undefined
                      }
                      defaultMonth={
                        searchParams.appointmentDate
                          ? new Date(searchParams.appointmentDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setSearchParams({
                            appointmentDate: format(date, "yyyy-MM-dd"),
                            page: "1",
                          });
                        } else {
                          const newQuery = { ...router.query };
                          delete newQuery.appointmentDate;
                          newQuery.page = "1";
                          router.push({ pathname: router.pathname, query: newQuery });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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

        <p className="text-muted-foreground">
          Note : Use appointment date filter to see appointment scheduled for
          today
        </p>
        <div className="p-6 border rounded-lg">
          {isPending && !isError ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : calls.length === 0 ? (
            <p className="text-muted-foreground text-center">No calls found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Appointment Date</TableHead>
                  <TableHead>Interested In</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Call Status</TableHead>
                  <TableHead>Order Initiation Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((c: any) => (
                  <TableRow key={c.userId}>
                    <TableCell>
                      {c?.profile?.firstName} {c?.profile?.lastName}
                    </TableCell>
                    <TableCell>{c?.profile?.phone || "-"}</TableCell>
                    <TableCell>
                      {c.appointmentDate
                        ? format(new Date(c?.appointmentDate), "PPP hh:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/category/${c?.category?.id}`}
                        target="blank"
                        className="inline-flex items-center gap-1 underline text-blue-500 hover:text-blue-700"
                      >
                        {c?.category?.name} <ExternalLink className="w-3 h-3" />
                      </Link>
                    </TableCell>
                    <TableCell>{c?.notes || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={c?.callStatus}
                        onValueChange={(val) => {
                          updateScheduledCall({ ...c, callStatus: val });
                        }}
                        disabled={isUpdatingCall}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CALL_STATUS_OPTIONS.slice(
                            1,
                            CALL_STATUS_OPTIONS.length,
                          ).map((field) => (
                            <SelectItem
                              key={field.value}
                              value={field.value}
                              disabled={field.value === PhoneCallStatus.PENDING}
                            >
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={c.orderInitiationStatus}
                        onValueChange={(val) => {
                          updateScheduledCall({
                            ...c,
                            orderInitiationStatus: val,
                          });
                        }}
                        disabled={isUpdatingCall}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_INITIATION_STATUS_OPTIONS.slice(
                            1,
                            ORDER_INITIATION_STATUS_OPTIONS.length,
                          ).map((field) => (
                            <SelectItem
                              key={field.value}
                              value={field.value}
                              disabled={
                                field.value === OrderInitiationStatus.PENDING
                              }
                            >
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-6 flex justify-between items-center">
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
    </AdminLayout>
  );
};

export default ScheduledCallsPage;
