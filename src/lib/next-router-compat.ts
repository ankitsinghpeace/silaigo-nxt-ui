"use client";

/**
 * Drop-in shim so legacy code that imported `useRouter` from `next/router`
 * (Pages Router) keeps working under the App Router.
 *
 * Provides:
 *  - callable form:   navigate("/foo")               -> router.push("/foo")
 *  - push/replace:    router.push("/foo")            (string)
 *                     router.push({ pathname, query }) (object form)
 *  - properties:      query, pathname, asPath, route, isReady, events(noop)
 */

import {
  useRouter as useAppRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { useMemo } from "react";

type UrlObject = {
  pathname?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
};

type Url = string | UrlObject;

function toHref(url: Url): string {
  if (typeof url === "string") return url;
  const pathname = url.pathname ?? "";
  const q = url.query ?? {};
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export type CompatRouter = {
  (url: Url): void;
  push: (url: Url, ...rest: unknown[]) => void;
  replace: (url: Url, ...rest: unknown[]) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: string) => void;
  query: Record<string, string>;
  pathname: string;
  asPath: string;
  route: string;
  isReady: boolean;
  events: {
    on: () => void;
    off: () => void;
    emit: () => void;
  };
};

export function useRouter(): CompatRouter {
  const nextRouter = useAppRouter();
  const params = useParams() as Record<string, string | string[]> | null;
  const searchParams = useSearchParams();
  const pathname = usePathname() ?? "/";

  return useMemo(() => {
    const query: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        query[k] = Array.isArray(v) ? v[0] ?? "" : (v as string);
      }
    }
    if (searchParams) {
      searchParams.forEach((value, key) => {
        query[key] = value;
      });
    }

    const search = searchParams?.toString() ?? "";
    const asPath = search ? `${pathname}?${search}` : pathname;

    const callable = ((url: Url) => nextRouter.push(toHref(url))) as CompatRouter;

    callable.push = (url: Url) => nextRouter.push(toHref(url));
    callable.replace = (url: Url) => nextRouter.replace(toHref(url));
    callable.back = () => nextRouter.back();
    callable.forward = () => nextRouter.forward();
    callable.refresh = () => nextRouter.refresh();
    callable.prefetch = (href: string) => {
      try {
        nextRouter.prefetch(href);
      } catch {
        /* noop */
      }
    };
    callable.query = query;
    callable.pathname = pathname;
    callable.asPath = asPath;
    callable.route = pathname;
    callable.isReady = true;
    callable.events = {
      on: () => {},
      off: () => {},
      emit: () => {},
    };

    return callable;
  }, [nextRouter, params, searchParams, pathname]);
}

export default useRouter;
