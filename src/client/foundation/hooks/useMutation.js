import { useCallback, useState } from "react";

import { useAuth } from "../contexts/AuthContext";

/**
 * @typedef {UseMutationOptions}
 * @property {string} method
 * @property {boolean=} auth
 */

/**
 * @template T
 * @typedef {object} ReturnValues
 * @property {T | null} data
 * @property {Error | null} error
 * @property {boolean} loading
 */

/**
 * @template T
 * @param {string} apiPath
 * @param {UseMutationOptions} options
 * @returns {[(body: any) => Promise<void>, ReturnValues<T>]}
 */
export function useMutation(apiPath, { auth, method }) {
  const [result, setResult] = useState({
    data: null,
    error: null,
    loading: true,
  });
  const { loggedIn, userId } = useAuth();

  const mutate = useCallback(
    async (data) => {
      if (auth && !loggedIn) {
        return;
      }

      setResult(() => ({
        data: null,
        error: null,
        loading: true,
      }));

      try {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        if (auth) {
          headers.append("X-App-Userid", userId);
        }
        const body = JSON.stringify(data);
        const req = new Request(apiPath, { body, headers, method });
        const res = await fetch(req);
        const resData = res.status !== 200 ? "" : res.json();

        setResult((cur) => ({
          ...cur,
          data: resData,
          loading: false,
        }));
      } catch (error) {
        setResult((cur) => ({
          ...cur,
          error,
          loading: false,
        }));
      }
    },
    [apiPath, auth, loggedIn, method, userId],
  );

  return [mutate, result];
}
