import Card from "../../atoms/Card";
import { getHeroesByAddress } from "../../queries/assets";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import NoContentAvailable from "../../atoms/NoContentAvailable";

const Assets = () => {
  const { authData } = useSelector((state: any) => state.auth);

  let {
    data: heroes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["heroes", authData.wallet_address],
    queryFn: () => getHeroesByAddress(authData.wallet_address),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const LoadingSkeleton = () => (
    <>
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="w-full max-w-[320px] rounded-xl shadow-xl p-2 sm:p-4 dark:bg-gray-800 bg-white dark:text-white text-gray-900 animate-pulse"
        >
          <div className="relative">
            <div className="w-full h-72 sm:h-64 dark:bg-gray-700 bg-gray-200 rounded-lg" />
            <div className="mt-2 sm:mt-4 text-center dark:border-gray-700 border-b-2 pb-2 sm:pb-3">
              <div className="h-4 sm:h-5 dark:bg-gray-700 bg-gray-200 rounded w-3/4 mx-auto" />
              <div className="h-2.5 sm:h-3 dark:bg-gray-700 bg-gray-200 rounded w-1/2 mx-auto mt-1" />
            </div>
          </div>

          <div className="mt-2 sm:mt-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col space-y-1">
                <div className="h-3 sm:h-4 dark:bg-gray-700 bg-gray-200 rounded w-2/3" />
                <div className="h-2.5 sm:h-3 dark:bg-gray-700 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 sm:h-3 dark:bg-gray-700 bg-gray-200 rounded w-1/3" />
                <div className="h-2.5 sm:h-3 dark:bg-gray-700 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-4">
            <div className="h-2 sm:h-2.5 dark:bg-gray-700 bg-gray-200 rounded-full w-full" />
            <div className="h-2 sm:h-2.5 dark:bg-gray-700 bg-gray-200 rounded-full w-4/5" />
            <div className="h-2 sm:h-2.5 dark:bg-gray-700 bg-gray-200 rounded-full w-3/4" />
          </div>

          <div className="flex justify-between mt-2 sm:mt-4">
            <div className="h-3 sm:h-4 dark:bg-gray-700 bg-gray-200 rounded w-1/4" />
            <div className="h-3 sm:h-4 dark:bg-gray-700 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      <div className="pb-24 sm:p-4 sm:pb-24 overflow-y-auto h-screen justify-center">
        {isLoading ? (
          <div className="w-full max-w-screen-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            <LoadingSkeleton />
          </div>
        ) : isError ? (
          <NoContentAvailable />
        ) : (
          <div className="w-full max-w-screen-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            {heroes?.result?.map((hero: any) => (
              <Card key={hero.id} hero={hero} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Assets;
