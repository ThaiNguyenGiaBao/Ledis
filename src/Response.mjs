class Response {
  static integer(value) {
    return "(integer) " + value;
  }
  static string(value) {
    return '"' + value + '"';
  }
  static emptyArray() {
    return "(empty array)";
  }
  static nil() {
    return "(nil)";
  }
  static ok() {
    return "OK";
  }
  static array(value) {
    if (!Array.isArray(value) || value.length == 0) {
      return Response.emptyArray();
    }
    let response = "";
    value.forEach((item, index) => {
      response += index + 1 + ") " + '"' + item + '"' + "\n";
    });
    return response;
  }
  static error(message) {
    return "ERROR: " + message;
  }
}

export default Response;
