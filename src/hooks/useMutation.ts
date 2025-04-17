import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";
import { fetcher } from "@/lib/fetcher"; // Your fetcher utility
type MutationAction = "create" | "update" | "delete";
export const useMutation = <T>(
  action: MutationAction,
  baseUrl: string,
  options?: SWRMutationConfiguration<
    unknown,
    any,
    string,
    T | undefined,
    unknown
  >,
) => {
  // Define the HTTP method
  const method =
    action === "create" ? "POST" : action === "update" ? "PUT" : "DELETE";

  // SWR mutation hook
  const { trigger, isMutating, error } = useSWRMutation(
    baseUrl,
    async (url: string, { arg }: { arg?: T }) => {
      const requestData = arg ? { ...arg } : undefined;
      return fetcher(url, {
        method,
        body: requestData ? JSON.stringify(requestData) : undefined,
      });
    },
    {
      ...options,
    },
  );

  return {
    trigger,
    isMutating,
    error,
  };
};
