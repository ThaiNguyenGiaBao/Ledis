const fruits = new Set();
fruits.add("apple").add("banana");
fruits.add("apple"); // duplicate, should be ignored
fruits.add("orange"); // new value, should be added

console.log(fruits); // Set(2) { 'apple', 'banana' }
