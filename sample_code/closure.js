/**
 * Example of "Closures" and some other important features of Javascript
 */

//Outer anonymus function returns inner function which is then assigned 
// to the variable "func"
var func = (function () { 

  //Inner function retain this variable value (outerFuncVar = 5) of outer function 
  // even though outer function finished execution - "Closures"
  var outerFuncVar = 5; 

  //Nested inner anonymus function                  
  return function(innerFuncParameter) { 
    console.log (`Sum: %s`, outerFuncVar + innerFuncParameter);
  }

//Outer function returned via self invoking
})(); 

//Sample calls
func(10); // Output: 5 + 10 = 15
func(15); // Output: 5 + 15 = 20