"use client";
import React, { useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMeasurementCategories,
  addMeasurementField,
  deleteMeasurementCategoryApi,
  deleteMeasurementFieldApi,
  editMeasurementCategoryApi,
  listMeasurementCategories,
  listMeasurementFields,
} from "@/services/modules/measurement-category.api";
import { Pencil, Trash2, Plus, Loader2, X } from "lucide-react";
import { IMeasurementCategory, IMeasurementField } from "@/types/interface";
import { MeasurementsSeetingsModal } from "@/components/admin/modals/MeasurementsSeetingsModal";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import slugify from "slugify";

type Props = {};

const MeasurementCategory = (props: Props) => {
  const [modalOpened, setModalOpened] = useState(false);
  const initialCategory = useRef<IMeasurementCategory>({
    name: "",
    label: "",
    fields: [],
  });
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<IMeasurementCategory[]>({
    queryKey: ["measurement-categories"],
    queryFn: () => listMeasurementCategories(),
  });

  const {
    data: mFields,
    isLoading: loadinfMFields,
    isError: mFieldsError,
  } = useQuery<IMeasurementField[]>({
    queryKey: ["measurement-fields"],
    queryFn: () => listMeasurementFields(),
  });

  // measurement category
  const {
    mutateAsync: createMeasurementCategory,
    isPending: isCreatingMeasurementcategory,
  } = useMutation({
    mutationFn: (data: any) => addMeasurementCategories(data),
    onSuccess: (res) => {
      queryClient.setQueryData<IMeasurementCategory[]>(
        ["measurement-categories"],
        (oldData) => (oldData ? [res, ...oldData] : [res]),
      );

      toast({
        title: "Success",
        description: "Category created successfully",
      });

      setModalOpened(false);
      initialCategory.current = { name: "", label: "", fields: [] };
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
    mutate: deleteMeasurementCategory,
    isPending: isDeletingMeasurementCategory,
  } = useMutation({
    mutationFn: (id: string) => deleteMeasurementCategoryApi(id),
    onSuccess: (res, id) => {
      queryClient.setQueryData<IMeasurementCategory[]>(
        ["measurement-categories"],
        (oldData) => oldData?.filter((cat) => cat.name !== id) || [],
      );

      toast({
        title: "Success",
        description: "Category deletd successfully",
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
    mutate: editMeasurementCategory,
    isPending: isEditingMeasurementCategory,
  } = useMutation({
    mutationFn: (data: IMeasurementCategory) =>
      editMeasurementCategoryApi(data),
    onSuccess: (res, id) => {
      queryClient.setQueryData<IMeasurementCategory[]>(
        ["measurement-categories"],
        (oldData) => {
          // if (!oldData) return [];

          const updated = oldData.map((elem) =>
            elem.name === res.name ? res : elem,
          );

          return updated;
        },
      );
      setModalOpened(false);
      initialCategory.current = { name: "", label: "", fields: [] };
      toast({
        title: "Success",
        description: "Category updated successfully",
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

  // measurement fields
  const {
    mutateAsync: createMeasurementField,
    isPending: isCreatingMeasurementField,
  } = useMutation({
    mutationFn: (data: any) => addMeasurementField(data),
    onSuccess: (res) => {
      queryClient.setQueryData<IMeasurementCategory[]>(
        ["measurement-fields"],
        (oldData) => (oldData ? [res, ...oldData] : [res]),
      );

      toast({
        title: "Success",
        description: "Field created successfully",
      });

      setModalOpened(false);
      initialCategory.current = { name: "", label: "", fields: [] };
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: generateErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const handleCreateMeasurementField = async () => {
    const name = window.prompt("enter name : ");

    if (!name) {
      return;
    }

    const cleaned = name
      .toLowerCase()
      .replace(/[^a-z0-9\s\-]/g, "")
      .trim();

    const id = slugify(cleaned, {
      replacement: "-",
      lower: true,
      strict: true,
    });

    await createMeasurementField({ id, name });
  };

  const {
    mutate: deleteMeasurementField,
    isPending: isDeletingMeasurementtField,
  } = useMutation({
    mutationFn: (id: string) => deleteMeasurementFieldApi(id),
    onSuccess: (res, id) => {
      queryClient.setQueryData<IMeasurementField[]>(
        ["measurement-fields"],
        (oldData) => oldData?.filter((field) => field.id !== id) || [],
      );

      toast({
        title: "Success",
        description: "Field deletd successfully",
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
      <div className="flex  flex-col gap-2 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Measurement Fields</h1>
          <Button
            className="flex items-center gap-2"
            onClick={handleCreateMeasurementField}
            disabled={isCreatingMeasurementField}
          >
            {isCreatingMeasurementField ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Measurement Field
          </Button>
        </div>
        <div className="w-full">
          <div className="flex flex-wrap gap-2">
            {mFields?.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm shadow-sm bg-white border border-gray-200"
                role="listitem"
              >
                <span className="truncate max-w-[18rem]">{item.name}</span>
                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => {
                    deleteMeasurementField(item.id);
                  }}
                  className="-mr-1 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300"
                >
                  <X size={14} />
                </button>
              </span>
            ))}

            {mFields?.length === 0 && (
              <div className="text-sm text-gray-500 italic">
                No measurements — all cleared.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Measurement Categories</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            initialCategory.current = { name: "", label: "", fields: [] };
            setModalOpened(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-500">Failed to load categories.</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Label</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0
            ? data.map((cat) => (
                <TableRow key={cat.name}>
                  <TableCell>{cat.label}</TableCell>
                  <TableCell>
                    {cat.fields.map((f) => f.name).join(", ")}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <button
                      className="p-1 hover:text-blue-600"
                      onClick={() => {
                        initialCategory.current = cat;
                        setModalOpened(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:text-red-600"
                      onClick={async () => {
                        deleteMeasurementCategory(cat.name);
                      }}
                      key={cat.name}
                    >
                      {isDeletingMeasurementCategory ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            : !isLoading &&
              !isError && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-gray-500"
                  >
                    No measurement categories found.
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>

      <MeasurementsSeetingsModal
        isOpen={modalOpened}
        onOpenChange={(val) => {
          setModalOpened(val);
        }}
        initialCategory={initialCategory.current}
        onAdd={async (data) => {
          createMeasurementCategory(data);
        }}
        onEdit={(data) => {
          editMeasurementCategory(data);
        }}
        isSaving={isCreatingMeasurementcategory || isEditingMeasurementCategory}
      />
    </AdminLayout>
  );
};

export default MeasurementCategory;
