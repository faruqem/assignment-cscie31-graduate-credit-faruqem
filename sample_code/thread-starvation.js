/**
 * Simulation of Thread Starvation
 */
  
var startTime = new Date();
setTimeout(function () {
  var endTime = new Date();
  var timeElapsed = Math.round((endTime-startTime)/1000);
  console.log("Time Elapsed in Sec(s): ", timeElapsed);
}, 3000);

         
//CPU intensive function
function fibonacciNumber(num) {
  if (num < 2)
    return 1;
  else
    return fibonacciNumber(num - 2) + fibonacciNumber(num - 1);
}

//Run with and then without commenting out the following CPU intensive 
// function call.          
//fibonacciNumber(45);