import Response from "./Response.mjs";

const asyncHandler =
  (fn, exact = true, minArgs = 1) =>
  (...args) => {
    if (exact && args.length != fn.length) {
      return Response.error("Invalid number of arguments");
    }
    if (!exact && args.length < minArgs) {
      return Response.error("Invalid number of arguments");
    }

    try {
      const result = fn(...args);
      return result;
    } catch (error) {
      //console.error("Error in async handler:", error);
      return Response.error(error.message);
    }
  };

export { asyncHandler };
