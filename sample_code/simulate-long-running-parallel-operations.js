/**
 * Simulating long running parallel operations using a single thread.
 */

 console.log("Simulating a long running operation like database access.");

 //Outer function            
 function clientRequest(request) {
   console.log('Accessing the database to retrieve data that may take long time to complete, for request id: ', request.id);
 
   //Inner function call that remembers the "request" passed from the outer function, 
   // characteristic of a closure. Results will be returned via the callback function "response".
   accesDBAndRetrieveData(request, response);
 }
 
 //Definition of inner function that returns the response via the anonymus callback
 // function represents by the variable "response" and passed to this function
 // as an argument to the parameter "callbackResponse".         
 function accesDBAndRetrieveData(request, callbackResponse) {
   // 1-5 secs operation simulation
   var timeoutMS = (Math.round(Math.random() * 4) + 1) * 1000;
   
   setTimeout(callbackResponse, timeoutMS, request);
 }
 
 //Anonymus callback function assigned to the variable "response"           
 var response = function (request) {
   var dbRecord = {};
   console.log('Response to request id:', request.id);   
   if(request.id == 1) {
     dbRecord = {
       "customer_id": 1,
       "customer_name": "Mo Faruqe"
     } 
   } else {
     dbRecord = {
       "customer_id": 2,
       "customer_name": "Ru Haque"
     }
   }
   
   console.log(dbRecord);
 }
             
 //Two sample calls to simulate two web requests
 clientRequest({ id: 1 });
 clientRequest({ id: 2 });   