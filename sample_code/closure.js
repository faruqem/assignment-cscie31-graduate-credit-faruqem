/*
  Outer function returns inner function which is then assigned 
  to a variable - a charactertistic of a first class function 
  i.e. function that can be treated like a regular variable.
*/
var func = (function () { //Outer anonymus function
    var outerFuncVar = 5; //Inner function retain this variable value of outer function 
                  //even though outer function finished execution - "Closure"
                      
    return function(innerFuncParameter) { //Nested inner anonymus function
      console.log (`Sum: %s`, outerFuncVar + innerFuncParameter);
    }
  })(); //Self invoked
  
  func(10); // Output: 5 + 10 = 15
  func(15); // Output: 5 + 15 = 20