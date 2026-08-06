"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getMetaMasterDataList } from "@/services/modules/category.api";
import { useQuery } from "@tanstack/react-query";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Table } from "@/components/ui/table";
import { generateErrorMessage } from "@/lib/helpers";
import { format } from "date-fns";
import {
  EditIcon,
  PlusIcon,
  TrashIcon,
  Percent,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  createCouponData,
  deleteCouponData,
  updateCouponData,
} from "@/services/modules/orders.api";
import {
  CouponSubType,
  PermissionSubType,
  PermissionType,
} from "@/types/enums";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/lib/next-router-compat";
import { buildRouterQuery, getQueryString, getRouterQueryValue } from "@/lib/router-query";

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

const COUPON_SUBTYPE_OPTIONS = [
  { value: CouponSubType.PERCENTAGE_REDUCTION, label: "Percentage Reduction" },
  { value: CouponSubType.PRICE_REDUCTION, label: "Price Reduction" },
];

const getSubtypeBadgeConfig = (subtype: string) => {
  switch (subtype) {
    case CouponSubType.PERCENTAGE_REDUCTION:
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: Percent,
      };
    case CouponSubType.PRICE_REDUCTION:
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: DollarSign,
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: DollarSign,
      };
  }
};

const getStatusBadgeConfig = (isActive: boolean) => {
  if (isActive) {
    return {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: CheckCircle,
    };
  } else {
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: XCircle,
    };
  }
};

const CouponsPage = () => {
  const router = useRouter();
  const searchParams = router.query as Record<string, string | string[] | undefined>;
  const setSearchParams = (params: Record<string, string | undefined>) => {
    router.push({
      pathname: router.pathname,
      query: buildRouterQuery(router.query, params),
    });
  };
  const [searchValue, setSearchValue] = useState(
    getRouterQueryValue(searchParams, "search"),
  );
  const sortBy = getRouterQueryValue(searchParams, "sortBy") || "newest";
  const limit = getRouterQueryValue(searchParams, "limit") || "20";
  const page = getRouterQueryValue(searchParams, "page") || "1";
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>({
    type: "coupon",
    subType: "",
    label: "",
    isActive: false,
    value: {
      expiryDate: "",
      amount: 0,
      nthOrder: 0,
      minOrderValue: 0,
      maxDiscount: 0,
    },
  });
  const { toast } = useToast();
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuth();
  const canEdit = user?.permissions?.includes(
    `${PermissionType.CONTENT}.${PermissionSubType.EDIT}`,
  );
  const canDelete = user?.permissions?.includes(
    `${PermissionType.CONTENT}.${PermissionSubType.DELETE}`,
  );
  const canCreate = user?.permissions?.includes(
    `${PermissionType.CONTENT}.${PermissionSubType.CREATE}`,
  );

  useEffect(() => {
    setSearchValue(getRouterQueryValue(searchParams, "search"));
    setSearchParams({ type: "coupon" });
  }, [searchParams]);

  const handleSearch = () => {
    const nextQuery: Record<string, string | undefined> = {
      type: "coupon",
      sortBy,
      limit,
      page: "1",
    };

    if (searchValue.trim()) {
      nextQuery.search = searchValue;
    }

    setSearchParams(nextQuery);
  };

  const handleSortChange = (val: string) => {
    setSearchParams({ type: "coupon", sortBy: val, page: "1" });
  };

  const handleLimitChange = (val: string) => {
    setSearchParams({ type: "coupon", limit: val, page: "1" });
  };

  const handlePagination = (newPage: number) => {
    setSearchParams({ type: "coupon", page: newPage.toString() });
  };

  const {
    data: couponsData,
    isPending: loadingCouponsData,
    error: fetchCouponsDataError,
    refetch: refetchCouponsData,
  } = useQuery({
    queryKey: ["coupons", getQueryString(searchParams)],
    queryFn: () => getMetaMasterDataList(getQueryString(searchParams)),
  });

  const tableData = couponsData?.items || [];
  const pagination = couponsData?.pagination;

  const { mutate: createCouponDataMutation, isPending: isCreatingCouponData } =
    useMutation({
      mutationFn: (data: any) => {
        const expiryDate = new Date(data.value.expiryDate + "T23:59:59.999Z");
        const currentDate = new Date();
        if (expiryDate < currentDate) {
          Promise.reject(new Error("Expiry date cannot be in the past"));
        }
        return createCouponData({
          ...data,
          value: { ...data.value, expiryDate: expiryDate },
        });
      },
      onSuccess: () => {
        setAddDialogOpen(false);
        refetchCouponsData();
        setSelectedCoupon({
          type: "coupon",
          subType: "",
          label: "",
          isActive: false,
          value: {
            expiryDate: "",
            amount: 0,
          },
        });
        toast({
          title: "Success",
          description: "Coupon created successfully",
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

  const { mutate: updateCouponDataMutation, isPending: isUpdatingCouponData } =
    useMutation({
      mutationFn: (data: any) => {
        const expiryDate = new Date(selectedCoupon.value.expiryDate);
        const currentDate = new Date();
        if (expiryDate < currentDate) {
          Promise.reject(new Error("Expiry date cannot be in the past"));
        }
        return updateCouponData(
          { ...data, value: { ...data.value, expiryDate: expiryDate } },
          selectedCoupon._id,
        );
      },
      onSuccess: () => {
        setAddDialogOpen(false);
        setIsEdit(false);
        setSelectedCoupon({
          type: "coupon",
          subType: "",
          label: "",
          isActive: false,
          value: {
            expiryDate: "",
            amount: 0,
          },
        });
        refetchCouponsData();
        toast({
          title: "Success",
          description: "Coupon updated successfully",
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

  const { mutate: deleteCouponDataMutation, isPending: isDeletingCouponData } =
    useMutation({
      mutationFn: (id: string) => deleteCouponData(id),
      onSuccess: () => {
        setSelectedCoupon({
          type: "coupon",
          subType: "",
          label: "",
          isActive: false,
          value: {
            expiryDate: "",
            amount: 0,
            nthOrder: 0,
            minOrderValue: 0,
            maxDiscount: 0,
            isVisible: false,
          },
        });
        refetchCouponsData();
        toast({
          title: "Success",
          description: "Coupon deleted successfully",
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Coupons Management
          </h1>
          <p className="text-muted-foreground">
            Manage and view all coupon data
          </p>

          <div className="flex justify-end">
            <Button
              onClick={() => setAddDialogOpen(true)}
              disabled={!canCreate}
            >
              <PlusIcon className="w-4 h-4" />
              Add Coupon
            </Button>
          </div>
        </div>

        <div className="p-6 border border-dashed rounded-lg">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">
                Search
              </label>
              <input
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search by label, subtype, or value..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={handleSortChange}>
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
              <Select value={limit} onValueChange={handleLimitChange}>
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
            <Button type="button" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {/* Error State */}
        {fetchCouponsDataError && (
          <div className="p-6 border rounded-lg text-center text-destructive">
            {generateErrorMessage(fetchCouponsDataError)}
          </div>
        )}

        {/* Loading State */}
        {loadingCouponsData && !fetchCouponsDataError && (
          <div className="p-6 border rounded-lg text-center text-muted-foreground">
            Loading...
          </div>
        )}

        {/* Table or No Data State */}
        {!loadingCouponsData && !fetchCouponsDataError && (
          <div className="p-0">
            <div className="p-6 border rounded-lg">
              {tableData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Subtype</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Nth Order</TableHead>
                      <TableHead>Min Order Value</TableHead>
                      <TableHead>Max Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visible on homepage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((item: any) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">
                          {item.label}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const subtypeConfig = getSubtypeBadgeConfig(
                              item.subType,
                            );
                            const SubtypeIcon = subtypeConfig.icon;
                            return (
                              <div
                                className={`inline-flex w-max   items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${subtypeConfig.bg} ${subtypeConfig.border} ${subtypeConfig.text}`}
                              >
                                <SubtypeIcon className="w-3 h-3" />
                                {COUPON_SUBTYPE_OPTIONS.find(
                                  (opt) => opt.value === item.subType,
                                )?.label || item.subType}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {item.subType === CouponSubType.PRICE_REDUCTION
                            ? `₹ ${item.value.amount}`
                            : `${item.value.amount}%`}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(item.value.expiryDate),
                            "PPP hh:mm a",
                          )}
                        </TableCell>
                        <TableCell>{item.value?.nthOrder || "N/A"}</TableCell>
                        <TableCell>
                          {item.value?.minOrderValue || "N/A"}
                        </TableCell>
                        <TableCell>
                          {item.value?.maxDiscount || "N/A"}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const statusConfig = getStatusBadgeConfig(
                              item.isActive,
                            );
                            const StatusIcon = statusConfig.icon;
                            return (
                              <div
                                className={`inline-flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {item.isActive ? "Active" : "Inactive"}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const statusConfig = getStatusBadgeConfig(
                              item.value.isVisible,
                            );
                            const StatusIcon = statusConfig.icon;
                            return (
                              <div
                                className={`inline-flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {item.value.isVisible
                                  ? "Visible"
                                  : "Not Visible"}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Edit"
                              onClick={() => {
                                setIsEdit(true);
                                setSelectedCoupon(item);
                                setAddDialogOpen(true);
                              }}
                              disabled={!canEdit}
                            >
                              <EditIcon className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              key={item._id}
                              variant="outline"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => {
                                setSelectedCoupon(item);
                                deleteCouponDataMutation(item._id);
                              }}
                              disabled={isDeletingCouponData || !canDelete}
                            >
                              <TrashIcon className="w-4 h-4 text-red-500" />
                              {isDeletingCouponData &&
                                item._id === selectedCoupon._id && (
                                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                                )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No coupons found.
                </div>
              )}
            </div>
            {/* Pagination Controls */}
            <div className="p-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {pagination?.count || 0} of {pagination?.total || 0}{" "}
                coupons
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    pagination?.prevPage &&
                    handlePagination(pagination.prevPage)
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
                    pagination?.nextPage &&
                    handlePagination(pagination.nextPage)
                  }
                  disabled={!pagination?.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className=" h-full max-h-full p-10 overflow-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Edit an existing coupon" : "Create a new coupon"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Subtype</Label>
              <Select
                value={selectedCoupon.subType}
                onValueChange={(val) =>
                  setSelectedCoupon({ ...selectedCoupon, subType: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subtype" />
                </SelectTrigger>
                <SelectContent>
                  {COUPON_SUBTYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Label</Label>
              <Input
                value={selectedCoupon.label.toUpperCase().trim()}
                onChange={(e) =>
                  setSelectedCoupon({
                    ...selectedCoupon,
                    label: e.target.value,
                  })
                }
                placeholder="Enter coupon label"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Amount</Label>
              <Input
                type="number"
                pattern="[0-9]*"
                value={selectedCoupon.value.amount}
                onChange={(e) =>
                  setSelectedCoupon({
                    ...selectedCoupon,
                    value: {
                      ...selectedCoupon.value,
                      amount: parseInt(e.target.value),
                    },
                  })
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={selectedCoupon.value.expiryDate.split("T")[0]}
                onChange={(e) =>
                  setSelectedCoupon({
                    ...selectedCoupon,
                    value: {
                      ...selectedCoupon.value,
                      expiryDate: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Nth Order</Label>
              <Input
                type="number"
                value={selectedCoupon.value.nthOrder}
                onChange={(e) =>
                  setSelectedCoupon({
                    ...selectedCoupon,
                    value: {
                      ...selectedCoupon.value,
                      nthOrder: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Min Order Value</Label>
              <Input
                type="number"
                value={selectedCoupon.value.minOrderValue}
                onChange={(e) =>
                  setSelectedCoupon({
                    ...selectedCoupon,
                    value: {
                      ...selectedCoupon.value,
                      minOrderValue: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Max Discount</Label>
              <Input
                type="number"
                value={selectedCoupon.value.maxDiscount}
                onChange={(e) =>
                  setSelectedCoupon({
                    ...selectedCoupon,
                    value: {
                      ...selectedCoupon.value,
                      maxDiscount: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedCoupon.isActive}
                  onCheckedChange={(val) =>
                    setSelectedCoupon({ ...selectedCoupon, isActive: val })
                  }
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedCoupon.value.isVisible}
                  onCheckedChange={(val) =>
                    setSelectedCoupon({
                      ...selectedCoupon,
                      value: { ...selectedCoupon.value, isVisible: val },
                    })
                  }
                />
                <Label>Is Visible On Homepage</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={isCreatingCouponData || isUpdatingCouponData}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() =>
                isEdit
                  ? updateCouponDataMutation(selectedCoupon)
                  : createCouponDataMutation(selectedCoupon)
              }
              disabled={isCreatingCouponData || isUpdatingCouponData}
            >
              {isCreatingCouponData || isUpdatingCouponData
                ? "Saving..."
                : isEdit
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CouponsPage;
