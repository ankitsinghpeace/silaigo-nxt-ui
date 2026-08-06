"use client";
import { addCustomizationMapping, deleteCustomizationMapping, editCustomizationMapping, fetchSubCategoryData, getCustomizationData } from "@/services/modules/category.api";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, AlertCircle, Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import { ContentPermissions } from "@/types/interface";

interface Category {
  _id: string;
  id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
}

interface Design {
  _id: string;
  title: string;
  imageUrl: string;
}

interface CustomizationOption {
  _id: string;
  type: string;
  options?: Design[];
}

interface MappingState {
  customizationType: string;
  categoryId: string;
  subCategoryIds: string[];
  optionIds: string[];
}

interface MappingListItem {
  _id: string,
  customizationType: string,
  categoryName: string,
  categoryId: string,
  subCategoryIds: string[],
  optionIds: string[]
}

interface CustomizationsOptionMappingEditorProps {
  categories: Category[];
  mappingList: MappingListItem[]
  inventoryPermission: inventoryPermissions;
}

type inventoryPermissions = ContentPermissions;


export const CustomizationsMapping = ({ categories, mappingList, inventoryPermission }: CustomizationsOptionMappingEditorProps) => {
  const [customizationsMappingList, setCustomizationsMappingList] = useState(mappingList);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<MappingListItem>(null);
  const [editingId,setIsEditingId] = useState("");
  const {toast} = useToast()

  const handleEdit = (item: MappingListItem) => {
    setSelectedMapping(item);
    setIsEditingId(item._id);
    setShowEditor(true);
  };

  const handleDelete = async (id:string)=>{
    try {
      const res = await deleteCustomizationMapping(id);
      const updatedList = customizationsMappingList.filter(item => item._id !== id);
      setCustomizationsMappingList(updatedList);
      toast({
        title:"Success",
        description:"Mapping deleted successfully",
      })
    } catch (error) {
      toast({
        title:"Something went wrong",
        description:generateErrorMessage(error),
        variant:"destructive"
      })
    }
  }

  const handleAdd = () => {
    setIsEditingId("");
    setShowEditor(true);
    setSelectedMapping({
      categoryId:"",
      customizationType:"",
      subCategoryIds:[],
      optionIds:[],
      categoryName:"",
      _id:""
    })
  };

  return (<div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm ">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Customizations Mapping</h2>
        <p className="text-slate-600 mt-1">Manage your customization type mappings</p>
      </div>
      <Button onClick={handleAdd} className="flex items-center gap-2" disabled={!inventoryPermission.create}>
        <Plus className="w-4 h-4" />
        Add Mapping
      </Button>
    </div>

    {customizationsMappingList.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <Plus className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No mappings found</h3>
        <p className="text-slate-600 mb-4">Get started by creating your first customization mapping.</p>
        <Button onClick={handleAdd} variant="outline" disabled={!inventoryPermission.create}>
          Create First Mapping
        </Button>
      </div>
    ) : (
      <div className="grid gap-4">
        {customizationsMappingList.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {item.customizationType}
                    </h3>
                    <p className="text-slate-600 mt-1">
                      Category: <span className="font-medium text-slate-800">{item.categoryName}</span>
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      ID: {item._id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  disabled={!inventoryPermission.edit}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={!inventoryPermission.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}



    <Dialog open={showEditor} onOpenChange={setShowEditor}>
      <DialogContent
        className="w-[calc(100%-100px)] h-[calc(100%-150px)] max-w-full max-h-full p-10 overflow-auto"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          position: "fixed",
        }}
      >
        <CustomizationsOptionMappingEditorPopUp categories={categories} mappingPrefill={{
          categoryId: selectedMapping?.categoryId,
          subCategoryIds: selectedMapping?.subCategoryIds,
          optionIds: selectedMapping?.optionIds,
          customizationType: selectedMapping?.customizationType,
        }} editingId={editingId} setCustomizationsMappingList={setCustomizationsMappingList}/>
      </DialogContent>
    </Dialog>
  </div>)

}

const CustomizationsOptionMappingEditorPopUp = ({ categories, mappingPrefill, editingId,setCustomizationsMappingList }: { categories: any, mappingPrefill: MappingState, editingId:string,setCustomizationsMappingList: React.Dispatch<React.SetStateAction<MappingListItem[]>> }) => {
  const [customizationsOptions, setCustomizationsOptions] = useState<CustomizationOption[]>([]);
  const [customizationOptionDesigns, setCustomizationOptionDesigns] = useState<Design[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState({
    customizations: false,
    subCategories: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<MappingState>(mappingPrefill);
  console.log(mappingPrefill)
  const {toast} = useToast();

  useEffect(() => {
    const fetchCustomizationsOptions = async () => {
      try {
        setLoading(prev => ({ ...prev, customizations: true }));
        setError(null);
        const response = await getCustomizationData();
        setCustomizationsOptions(response || []);
      } catch (err) {
        setError('Failed to load customization options');
        console.error('Error fetching customizations:', err);
      } finally {
        setLoading(prev => ({ ...prev, customizations: false }));
      }
    };
    fetchCustomizationsOptions();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!mapping.categoryId) {
        setSubCategories([]);
        return;
      }

      try {
        setLoading(prev => ({ ...prev, subCategories: true }));
        setError(null);
        const category = categories.find((cat) => cat._id === mapping.categoryId);

        if (category) {
          const res = await fetchSubCategoryData(Number(category.id));
          if(!mappingPrefill.categoryId){
            setMapping({ ...mapping, subCategoryIds: [] })
          }
          setSubCategories(res?.styles || []);
        }
      } catch (err) {
        setError('Failed to load subcategories');
        console.error('Error fetching subcategories:', err);
      } finally {
        setLoading(prev => ({ ...prev, subCategories: false }));
      }
    };

    fetchSubCategories();
  }, [mapping.categoryId, categories]);

  useEffect(() => {
    if (!mapping.customizationType) {
      setCustomizationOptionDesigns([]);
      return;
    }

    const target = customizationsOptions.find((customization) =>
      customization.type === mapping.customizationType
    );
    if(!mappingPrefill.categoryId){
      setMapping({ ...mapping, optionIds: [] })
    }
    setCustomizationOptionDesigns(target?.options || []);
  }, [mapping.customizationType, customizationsOptions]);

  const handleToggleSubCategory = (subCategoryId: string) => {
    setMapping(prev => ({
      ...prev,
      subCategoryIds: prev.subCategoryIds.includes(subCategoryId)
        ? prev.subCategoryIds.filter(id => id !== subCategoryId)
        : [...prev.subCategoryIds, subCategoryId]
    }));
  };

  const handleToggleDesign = (designId: string) => {
    setMapping(prev => ({
      ...prev,
      optionIds: prev.optionIds.includes(designId)
        ? prev.optionIds.filter(id => id !== designId)
        : [...prev.optionIds, designId]
    }));
  };

  const resetForm = () => {
    setMapping({
      customizationType: "",
      categoryId: "",
      subCategoryIds: [],
      optionIds: []
    });
    setSubCategories([]);
    setCustomizationOptionDesigns([]);
  };

  const handleEdit = async ()=>{
    try {
      if(editingId === ""){
        toast({
          title:"Invalid editing id",
          description:"Invalid editing id",
          variant:"destructive"
        });
        return
      }
      const res = await editCustomizationMapping(mapping,editingId);
      if(res){

        setCustomizationsMappingList((prev)=>{
          const filtered = prev.map((elem)=>{
           return elem._id === res._id ? {...elem,...res} : elem
          });
          return filtered;
        })
      }
      toast({
        title:"Success",
        description:"Mapping updated successfully",
      })
    } catch (error) {
      toast({
        title:"Something went wrong",
        description:generateErrorMessage(error),
        variant:"destructive"
      })
    }
  }

  const handleAdd = async ()=>{
    try {
      const res = await addCustomizationMapping(mapping);
      const category = categories.find((cat)=>{
        return cat._id === res.categoryId
      })
      if(res){
        setCustomizationsMappingList((prev)=>{
          return [
            ...prev,
            {...res,categoryName:category.name}
          ]
        })
      }
      toast({
        title:"Success",
        description:"Mapping addedd successfully",
      })
    } catch (error) {
      toast({
        title:"Something went wrong",
        description:generateErrorMessage(error),
        variant:"destructive"
      })
    }
  }

  const handleSave = async ()=>{
    if(mappingPrefill.categoryId){
      await handleEdit()
      return;
    }else{
      await handleAdd()
    }
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Customization Mapping</h2>
          <div className="flex items-center gap-4 text-sm bg-slate-100 px-4 py-2 rounded-lg">
            <span className="text-slate-600">
              Category: <span className="font-medium text-slate-800">
                {mapping.categoryId ? categories.find(c => c._id === mapping.categoryId)?.name || 'Unknown' : 'None'}
              </span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Type: <span className="font-medium text-slate-800">
                {mapping.customizationType || 'None'}
              </span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Subcategories: <span className="font-medium text-blue-600">{mapping.subCategoryIds.length}</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Designs: <span className="font-medium text-blue-600">{mapping.optionIds.length}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetForm} variant="outline" size="sm">
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!mapping.categoryId || !mapping.customizationType}
            size="sm"
            variant="default"
          >
            Save Mapping
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">Category</label>
          <Select
            value={mapping.categoryId}
            onValueChange={(value) => setMapping(prev => ({ ...prev, categoryId: value }))}
            disabled={editingId != ""}
          >
            <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">Customization Type</label>
          <Select
            value={mapping.customizationType}
            onValueChange={(value) => setMapping(prev => ({ ...prev, customizationType: value }))}
            disabled={loading.customizations || editingId!=""}
          >
            <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Choose customization type" />
              {loading.customizations && <Loader2 className="h-4 w-4 animate-spin" />}
            </SelectTrigger>
            <SelectContent>
              {customizationsOptions?.map((option) => (
                <SelectItem key={option._id} value={option.type}>
                  {option.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-800">Subcategories</h3>
          {loading.subCategories && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
        </div>

        {subCategories.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {subCategories.map((subCategory) => {
              const isSelected = mapping.subCategoryIds.includes(subCategory._id);
              console.log(isSelected)
              return (
                <Button
                  key={subCategory._id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`
                    flex items-center gap-2 transition-all duration-200 hover:scale-105
                    ${isSelected
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "hover:bg-slate-100 border-slate-300"
                    }
                  `}
                  onClick={() => handleToggleSubCategory(subCategory._id)}
                >
                  {isSelected ? (
                    <MinusIcon className="w-4 h-4" />
                  ) : (
                    <PlusIcon className="w-4 h-4" />
                  )}
                  {subCategory.name}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="text-slate-500 text-sm py-4">
            {mapping.categoryId ? "No subcategories available" : "Select a category to view subcategories"}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Design Options</h3>

        {customizationOptionDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {customizationOptionDesigns.map((design) => {
              const isSelected = mapping.optionIds.includes(design._id);
              return (
                <div
                  key={design._id}
                  className={`
                    relative group cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden
                    ${isSelected
                      ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }
                  `}
                  onClick={() => handleToggleDesign(design._id)}
                >
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    {design.imageUrl ? (
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.35em' fill='%2394a3b8' font-family='sans-serif' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                    )}

                    <div className={`
                      absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                      ${isSelected ? "bg-blue-600 text-white" : "bg-white/80 text-slate-600"}
                    `}>
                      {isSelected ? (
                        <MinusIcon className="w-4 h-4" />
                      ) : (
                        <PlusIcon className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    <h4 className="font-medium text-slate-900 text-sm truncate">
                      {design.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-slate-500 text-sm py-8 text-center">
            {mapping.customizationType ? "No design options available" : "Select a customization type to view designs"}
          </div>
        )}
      </div>

      {(mapping.subCategoryIds.length > 0 || mapping.optionIds.length > 0) && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">Selection Summary</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <div>Subcategories: {mapping.subCategoryIds.length} selected</div>
            <div>Design options: {mapping.optionIds.length} selected</div>
          </div>
        </div>
      )}
    </div>
  );
};
