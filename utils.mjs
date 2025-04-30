// 1. Our “decorator” factory: takes an original function, returns a wrapped one
function logDecorator(fn) {
    return function(...args) {
      console.log(`→ Calling ${fn.name} with`, args);
      const result = fn.apply(this, args);
      console.log(`← ${fn.name} returned`, result);
      return result;
    };
  }
  
  // 2. A simple function we want to decorate
  function add(x, y) {
    return x + y;
  }
  
  // 3. Create a decorated version
  const addWithLogging = logDecorator(add);
  
  // 4. Call it
  addWithLogging(2, 3);
  // Console:
  // → Calling add with [2, 3]
  // ← add returned 5
  