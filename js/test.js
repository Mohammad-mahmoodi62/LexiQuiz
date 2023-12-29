function shuffleArray(array) {
    array.sort(() => Math.random() - 0.5);
    return array;
  }
  
  // Example usage:
  const myArray = [1, 2, 3, 4, 5];
  shuffleArray(myArray);
  console.log(myArray); // Output: [3, 5, 2, 1, 4] (random order)
  