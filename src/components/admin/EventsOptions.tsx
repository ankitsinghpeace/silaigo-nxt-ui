"use client";
import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    addMicroEventToTimeLine,
    getMicroTaskTimeLine,
    getRoleOrderOptions,
} from "@/services/modules/orders.api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import OrderTimelineView from "../OrderTImeLineView";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderProcessingState } from "@/types/enums";
import Swal from "sweetalert2";

const OrderProcessingStateTimeLineMap = {
    'Order fulfilled': OrderProcessingState.ORDER_PLACED,
    'Cutting End': OrderProcessingState.CUTTING_COMPLETE,
    'Stitching End': OrderProcessingState.STITCHING_COMPLETE,
};


export default function EventsOptions({ orderId }) {
    const [optionsToUpdate, setOptionsToUpdate] = useState({
        optionsData: [], // contains detailed key , label , other fields
        state: {} // only key value => for optimistic update
    });
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: optionsData, isLoading: loadingOptions, isSuccess: loadedEventOptions, refetch } = useQuery({
        queryKey: ["eventOptions", user.role, orderId],
        queryFn: async () => await getRoleOrderOptions(orderId),
    });


    // const { data: timelineData, isLoading: loadingTimeline, } = useQuery({
    //     queryKey: ["eventTimeline", orderId, user.role],
    //     queryFn: async () => await getMicroTaskTimeLine(orderId),
    //     enabled: !!orderId,
    // });

    // useEffect(() => {
    //     if (timelineData && timelineData.length > 0 && optionsData) {
    //         // console.log(timelineData)
    //         // const options = {};
    //         // timelineData.map(({ key, value }) => {
    //         //     options[key] = value;
    //         // });

    //         // setInputValues(options)

    //         const initialState = {};
    //         optionsData?.forEach((opt) => {
    //             initialState[opt.label] = opt.type === "checkbox" ? false : ""
    //         });

    //         timelineData.map((el) => {
    //             initialState[el.key] = el.value;
    //         })

    //         setInputValues(initialState);
    //     }
    // }, [timelineData]);

    const mutation = useMutation({
        mutationFn: async (payload: any) => await addMicroEventToTimeLine(payload),
        onSuccess: async () => {
            await refetch();
            setOptionsToUpdate((prev) => {
                return {
                    optionsData: [],
                    state: {}
                }
            })
            toast({ description: "Event added successfully", className: "bg-green-500 text-white" });
        },
        onError: () => {
            setOptionsToUpdate((prev) => {
                return {
                    optionsData: [],
                    state: {}
                }
            })
            toast({ description: "Something went wrong", className: "bg-red-500 text-white" });
        },
    });


    const confirmOrderCycleComplete = async (status: string): Promise<boolean> => {
        const result = await Swal.fire({
            title: 'Confirm',
            text: `Are you sure that ${status} and send it to next stage ?`,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: true,
            focusCancel: true,
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-none',
                confirmButton: 'bg-red-600 text-white px-4 py-2',
                cancelButton: 'bg-white border border-gray-300 px-4 py-2 text-gray-700'
            }
        });

        return result.isConfirmed;
    };


    // const handleAction = async (option, checkedValue = true) => {
    //     if (option.savedValue && !option.repeatable) return;

    //     if (OrderProcessingStateTimeLineMap[option.label]) {
    //         const isConfirmed = await confirmOrderCycleComplete(option.label);
    //         if (!isConfirmed) return;
    //     }

    //     const payload = {
    //         orderId,
    //         status: option.label,
    //         key: option.label,
    //         value: checkedValue,
    //     };

    //     setOptionsToUpdate((prev) => {
    //         const updatedOptions = prev.optionsData.filter((el) => {
    //             return el.key != payload.key
    //         });

    //         const serverValue = optionsData.aggregatedState[option.label];

    //         if (checkedValue === serverValue) {
    //             return {
    //                 optionsData: [...updatedOptions],
    //                 state: { ...prev.state, [payload.key]: payload.value }
    //             }
    //         }

    //         return {
    //             optionsData: [...updatedOptions, payload],
    //             state: { ...prev.state, [payload.key]: payload.value }
    //         }
    //     })

    // };

    const handleAction = async (option, clickedIndex, checkedValue = true) => {
        if (option.savedValue && !option.repeatable) return;
        if (OrderProcessingStateTimeLineMap[option.label]) {
            const isConfirmed = await confirmOrderCycleComplete(option.label);
            if (!isConfirmed) {
                setOptionsToUpdate((prev) => {
                    return {
                        optionsData: [],
                        state: {}
                    }
                })
                toast({ description: "Rollback to original state", className: "bg-blue-500 text-white" });
                return;
            }
        }

        setOptionsToUpdate((prev) => {
            let updatedOptionsData = [...prev.optionsData];
            let updatedState = { ...prev.state };

            for (let i = 0; i <= clickedIndex; i++) {
                const option = optionsData.options[i];
                const serverValue = optionsData.aggregatedState[option.label];

                updatedState[option.label] = checkedValue;

                if (checkedValue !== serverValue) {

                    updatedOptionsData = updatedOptionsData.filter(el => el.key !== option.label);
                    updatedOptionsData.push({
                        orderId,
                        status: option.label,
                        key: option.label,
                        value: checkedValue,
                    });
                } else {
                    updatedOptionsData = updatedOptionsData.filter(el => el.key !== option.label);
                }
            }

            return {
                optionsData: updatedOptionsData,
                state: updatedState
            };
        });
    };


    if (loadingOptions) return <div>Loading...</div>;
    if (!optionsData || optionsData.length === 0) return null;


    return (
        <div className="space-y-4 p-4 relative">
            {optionsData.options.map((option, i) => (
                <div key={option.label} className={cn("flex items-start space-x-2", mutation.isPending ? "pointer-events-none" : "")}>
                    {option.type === "checkbox" && (
                        <Checkbox
                            checked={optionsToUpdate.state[option.label] ?? optionsData.aggregatedState[option.label]}
                            onCheckedChange={(checked) => handleAction(option, i, checked as boolean)}
                        />
                    )}



                    {(option.type === "checkbox" || option.type === "action") && (
                        <label className="text-sm font-medium">{option.label}</label>
                    )}

                </div>
            ))}

            <div className="flex gap-2">
                <Button
                    disabled={optionsToUpdate.optionsData.length === 0 || mutation.isPending}
                    className="relative"
                    onClick={() => {
                        mutation.mutateAsync({ events: optionsToUpdate.optionsData, orderId })
                    }}
                >
                    <span className={cn(mutation.isPending && "opacity-0")}>
                        Update
                    </span>

                    {mutation.isPending && (
                        <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin" />
                    )}
                </Button>
                <Button className="bg-red-500 hover:bg-red-700" onClick={
                    () => {
                        setOptionsToUpdate((prev) => {
                            return {
                                optionsData: [],
                                state: {}
                            }
                        })
                    }
                }>
                    Reset
                </Button>
            </div>
        </div>
    );
}