let highest = 0;

for (let first = 999; first > 0; first--) {
  for (let second = 999; second > 0; second--) {
    const product = first * second;
    if ((product > highest) && isPalindrome(product)) {
      highest = product;
    }
  }
}

function isPalindrome(num) {
  const splitNumber = String(num).split('');
  const splitNumberReversed = [].concat(splitNumber).reverse();
  return arraysAreEqual(splitNumberReversed, splitNumber);
}

function arraysAreEqual(arr1, arr2) {
  return arr1.every((val, idx) => {
    return arr2[idx] === val;
  });
}

console.log(highest);
