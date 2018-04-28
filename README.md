## CSCI E-31 Graduate Credit Assignment
### Option #3: Prove Your Understanding
### Subject: Node.js Fundamentals and Performance
### Student: Mohiuddin Faruqe

In this article we will look into some Node.js internals and performance. We will discuss:
1. Closures, first class function and other JavaScript features that will help us understanding Node.js design principles.
2. How Node.js handles multiple client requests asynchonoisly with a single thread.
3. Thread starvation and why Node.js is not particularly suitable for CPU intensive tasks.
4. How we can use Node.js "cluster" module to take adavantage of a multi-core system.

### Closures, First Class Function and other JavaScript Features:
To understand Node.js performance, first we need to understand an important concept of JavaScript - "Closures". Below is the example of a closures where the inner function has access to the variable value (`outerFuncVar = 5`) of the outer function even when the outer function has finished execution. This example also demonstrates few other important concepts of JavaScript language: 
* Anonymus function - a function without a name.
* Nested function - a function defined within another function.
* First-class function - a function treated like a regular variable. 
* Self invoking function - function invoked while defined.  

#### Please, read the inline comments while checking the code below for more explanation. You can also execute this code snippet in JSFiddle at the given URL to see the output in console (please, make sure your browser console is open):

```
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
```
### Handling of Multiple Client Requests
Now with our above knowledge of JavaScript, using closures let's simulate two web requests that require long opeartion of database access to retireve data. Using *setTimeout* function, long running operation has been simulated. We can see from the execution of `function clientRequest()`, request 1 did not block request 2, when the result is returned because of closure characteristics, the result set of request 1 and 2 correctly identified without any mixing up. *This represents the event-driven, non-blocking I/O model of Node.js using a single thread*. Because of the usage of a single thread to handle multiple requests, no time has been lost in context switching or new thread creation. At the same time none of the requests blocked each other and all of them ran simultaneously. As soon as the operation is completed, the response is sent to the appropriate request via its callback function.  </p>

#### Please, read the inline comments while checking the code below for more explanation. You can also execute this code snippet in JSFiddle at the given URL to see the output in console (please, make sure your browser console is open): https://jsfiddle.net/faruqem/1wmn7f2p/

```
/**
  * Simulating long running parallel operations using a single thread.
  */

console.log("Simulating a long running operation like database access.");

//Outer function            
function clientRequest(request) {
  console.log('Accessing the database to retrieve data that may take long time to complete, for request id: ', request.id);

  //Inner function call that remembers the "request" passed from the outer function, // characteristic of a closure. Results will be returned via the callback function // "response".
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
```

#### Sample output:
```
Accessing the database to retrieve data that may take long time to complete, for request id: 1
Accessing the database to retrieve data that may take long time to complete, for request id: 2
Response to request id: 2
{customer_id: 2, customer_name: "Ru Haque"}
Response to request id: 1
{customer_id: 1, customer_name: "Mo Faruqe"}
```


### Thread Starvation

Our sample code above simulated a database operation. Node.js is primarily suited for this kind of I/O operation. But it's not very effcient in case of any CPU instensive operation. Look at the code sample below. There is function fibonacciNumber() to simulate a CPU intensive long running operation. By commenting out this function, when we run the code block it takes around 3 secs to finish the execution since SetTimeout() function is set to return the execute the callback function after 3,000 ms i.e. 3 secs. But if we uncomment the fibonacci function which simlulates CPU intesive operation, callback function of the setTimeout() function returns approx. 15 secs after (may vary a little based on your computer's CPU power), instead of 3 secs! It's because though both the operations started asychronously, the fibonacci function blocked the CPU, so the setTimeout() function from the same thread could not finish its execution on time. This is called Thread Startvation. So Node.js is good for database related longrunning operation which does not block the CPU but not very efficent if you are running concurrent CPU intesive operation using a single thread. 

#### Please, read the inline comments while checking the code below for more explanation. You can also execute this code snippet in JSFiddle at the given URL to see the output in console (please, make sure your browser console is open): https://jsfiddle.net/faruqem/8o6f5y96/

```
/**
  * Simulation of Thread Starvation
  */
  
var startTime = new Date();
setTimeout(function () {
  var endTime = new Date();
  var timeElapsed = Math.round((endTime-startTime)/1000);
  console.log("Time Elapsed in Sec(s): ", timeElapsed);
}, 3000);

//Run with and then without commenting out the following CPU intensive 
// calculation part.         
///*
function fibonacciNumber(num) {
  if (num < 2)
    return 1;
  else
    return fibonacciNumber(num - 2) + fibonacciNumber(num - 1);
}
          
fibonacciNumber(45);
//*/
```

### Node.js "cluster" module

In the above discussion and example we saw Node.js is single threaded and optimized for single processor. Nonetheless, it is possible to utilize all the processor availble to a multi-core system using a module called "cluster" which is part of a core Node.js. Please, note that the processes do not share any common memory rather all inter process communications happen via IPC i.e. Inter Process Communication channel.

#### If you have node.js installed on your machine, you can copy/paste or download the node-cluster.js file from the "sample_code" folder and run command `$ node node-cluster` to see the output.

```
/**
  * Node.js "cluster" module example.
  * This helps to utilize all CPU cores available to a particular system.
*/
const cluster = require('cluster');
const http = require('http');
const totalCPUs = require('os').cpus().length;
           
let workers =[];
           
//Check the process type and call appropriate function
if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();
}
           
//Define master process function
function masterProcess() {
  console.log(`Master process ${process.pid} is running.`);
           
  //Create workers
  for (var i = 0; i < totalCPUs; i++) {
    console.log(`Starting worker process: ${i + 1}`);
    var worker = cluster.fork();
           
    //Store the worker process details in an array
    workers.push(worker);
                   
    //Listen to message from worker(s)
    worker.on('message', (msg) => {
      console.log(`Master process ${process.pid} received message: ${JSON.stringify(msg)}.`);
    });
  }
           
  //Send message to workers
  workers.forEach((worker) => {
    worker.send({
        msg: `Message from master ${process.pid} to worker ${worker.process.pid}`
     });
  }, this);
           
  // Listen to worker(s) exiting, if they do
  cluster.on('exit',  (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} exited!`);
  });
}
           
//Define child process function
function childProcess() {
  console.log(`Worker process ${process.pid} started.`);
               
  //Read message from master
  process.on('message', (msg) => {
    console.log(`Worker process ${process.pid} received message: ${JSON.stringify(msg)}.`);
  });
           
  //Send a message to master
  process.send({
    msg:`Message from worker process: ${process.pid} to master.`
  });
  console.log(`Worker process ${process.pid} finished.`);
           
  /* 
    To exit uncomment the following two lines.
    Don't exit if would like to keep the server running
  */
  //console.log(`Worker process ${process.pid} exiting.`);
  //process.exit();
               
  // Workers can share TCP connection
  http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("Message from the worker: " + cluster.worker.process.pid);
  }).listen(8989);
}
```
#### Sample output on my Mac (with 8 cores):           
```
Master process 14468 is running.
Starting worker process: 1
Starting worker process: 2
Starting worker process: 3
Starting worker process: 4
Starting worker process: 5
Starting worker process: 6
Starting worker process: 7
Starting worker process: 8
Worker process 14470 started.
Worker process 14470 finished.
Master process 14468 received message: {"msg":"Message from worker process: 14470 to master."}.
Worker process 14469 started.
Worker process 14469 finished.
Master process 14468 received message: {"msg":"Message from worker process: 14469 to master."}.
Worker process 14469 received message: {"msg":"Message from master 14468 to worker 14469"}.
Worker process 14470 received message: {"msg":"Message from master 14468 to worker 14470"}.
Worker process 14472 started.
Worker process 14472 finished.
Master process 14468 received message: {"msg":"Message from worker process: 14472 to master."}.
Worker process 14475 started.
Worker process 14475 finished.
Master process 14468 received message: {"msg":"Message from worker process: 14475 to master."}.
Worker process 14472 received message: {"msg":"Message from master 14468 to worker 14472"}.
Worker process 14475 received message: {"msg":"Message from master 14468 to worker 14475"}.
Worker process 14474 started.
Worker process 14474 finished.
Master process 14468 received message: {"msg":"Message from worker process: 14474 to master."}.
Worker process 14473 started.
Worker process 14473 finished.
Master process 14468 received message: {"msg":"Message from worker process: 14473 to master."}.
Worker process 14476 started.
Worker process 14474 received message: {"msg":"Message from master 14468 to worker 14474"}.
Worker process 14476 finished.
Master process 14468 received message: {"msg":"Message from worker process: 14476 to master."}.
Worker process 14471 started.
Worker process 14473 received message: {"msg":"Message from master 14468 to worker 14473"}.
Worker process 14471 finished.
Master process 14468 received message: {"msg":"Message from worker process: 14471 to master."}.
Worker process 14476 received message: {"msg":"Message from master 14468 to worker 14476"}.
Worker process 14471 received message: {"msg":"Message from master 14468 to worker 14471"}.    
```
Anyway, it's better to use mutiple servers with a single processor using traditional load balancing system rather than using a single server with mutiple core. This is to avoid any overhead involved with creating and managing multiple worker processes.

Hope this above examples and explanations gave you a better idea of Node.js internals and performnace basics.