/*
Run with and then without commenting out the CPU
intensive calculation part at the bottom.
With commenting out time elapsed is around 3 Secs.
Without commenting out time elapsed is approx 15 Secs depending on your machine's CPU power. 
*/
var startTime = new Date();
setTimeout(function () {
  var endTime = new Date();
  var timeElapsed = Math.round((endTime-startTime)/1000);
  console.log("Time Elapsed in Sec(s): ", timeElapsed);
}, 3000);
          
///*
//Start a CPU intensive calculation
function fibonacciNumber(num) {
  if (num < 2)
    return 1;
  else
    return fibonacciNumber(num - 2) + fibonacciNumber(num - 1);
}
          
fibonacciNumber(45);
//*/