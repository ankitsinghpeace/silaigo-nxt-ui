import { useState, useEffect } from "react";
import { DateRange } from "@/lib/adminSampleData";
import {
  getOverview,
  getFinance,
  getOperations,
  getOrders,
  OverviewResponse,
  FinanceResponse,
  OperationsResponse,
  OrdersResponse,
} from "@/services/analytics.api";

export const useOverview = (range: DateRange) => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getOverview(range);
        setData(result);
      } catch (err) {
        setError("Failed to fetch overview data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  return { data, loading, error };
};

export const useFinance = (range: DateRange) => {
  const [data, setData] = useState<FinanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getFinance(range);
        setData(result);
      } catch (err) {
        setError("Failed to fetch finance data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  return { data, loading, error };
};

export const useOperations = (range: DateRange) => {
  const [data, setData] = useState<OperationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getOperations(range);
        setData(result);
      } catch (err) {
        setError("Failed to fetch operations data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  return { data, loading, error };
};

export const useOrders = (query: any) => {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getOrders(query);
        setData(result);
      } catch (err) {
        setError("Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(query)]);

  return { data, loading, error };
};
