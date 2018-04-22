## CSCI E-31 Graduate Credit Assignment
### Option #3: Prove Your Understanding
### Subject: Node.js Fundamentals and Performance
### Student: Mohiuddin Faruqe


### Closure: https://jsfiddle.net/faruqem/4w12hko1/
### Simulating a long operation: https://jsfiddle.net/faruqem/1wmn7f2p/
### Thread starvation: https://jsfiddle.net/faruqem/8o6f5y96/

In this article we will look into some Node.js internals and performance. We will discuss:
    * Closures, first class function and other JavaScript features that will help us understanding Node.js design principles.
    * How Node.js handles multiple client requests asynchonoisly with a single thread.
    * Thread starvation and why Node.js is not particularly suitable for CPU intensive tasks.
    * How we can use Node.js "cluster" module to take adavantage of a system with multi-core.


<p>To understand Node.js performance, first we need to understand an important concept of JavaScript - "Closure". Below is the example of a closure where the inner function has access to the variable of the outer function even when the outer function has finished execution. This example also demonstrates few other important concepts of JavaScript function - anonymus function, nested function, first-class function and self invoking function.  
```
    /**
      * Outer function returns inner function which is assigned 
      * to a variable - charactertistics of a first class function i.e. function that can be
      * treated like a regular variable.
    */
    var func = (function () { //Outer anonymus function
		            var outerFuncVar = 5; //Inner function retain this variable value of outer function 
    						  //even though outer function finished execution - Closure
                    
                    return function(innerFuncParameter) { //Nested inner anonymus function
    	                console.log (`Sum: %s`, outerFuncVar + innerFuncParameter);
                    }
                })(); //Self invoked

    func(10); // 5 + 10 = 15
    func(15); // 5 + 15 = 20
```
<p>Now with our above knowledge of JavaScript, using closures let's simulate two web requests that require long opeartion of database access to retireve data. Using setTimeout function, long operation has been simulated. We can see from the execution of function clientRequest, request 1 did not block request 2, when the result is returned because of closure characteristics, the result set of request 1 and 2 correctly identified without any mixing up. This represents the event-driven, non-blocking I/O model of Node.js using a single thread. Because of the usage of a single thread to handle multiple requests, no time has been lost in context switching or new thread creation. At the same time none of the request blocked each other and all of them ran simultaneously. As soon as one request was completed, the response was sent to the appropriate request.  </p>
<pre>
  <code>
    console.log("");
    console.log("Simulating a long operation like database access");
    console.log("-------------------------------------------");
            
    function clientRequest(request) {
        console.log('Accessing the database to retrieve data that may take long time to complete, for request id: ', request.id);
        accesDBAndRetrieveData(request, response);
    }
            
    function accesDBAndRetrieveData(request, callbackResponse) {
        // 1-5 secs operation simulation
        var timeoutMS = (Math.round(Math.random() * 4) + 1) * 1000;
        setTimeout(callbackResponse, timeoutMS, request);
    }
            
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
            
    //Simulate two web requests
    clientRequest({ id: 1 });
    clientRequest({ id: 2 });

    /* Sample output:
    Accessing the database to retrieve data that may take long time to complete, for request id: 1
    Accessing the database to retrieve data that may take long time to complete, for request id: 2
    Response to request id: 2
    {customer_id: 2, customer_name: "Ru Haque"}
    Response to request id: 1
    {customer_id: 1, customer_name: "Mo Faruqe"}
    */            
    </code>
</pre>
<p>Our sample code above simulated a database operation. Node.js is primarily suited for this kind of operation. But it's not very effcient in case of any CPU instensive operation. Look at the code sample below. There is function fibonacciNumber() to simulate a CPU intensive long running operation. By commenting out this function, when we run the code block it takes around 3 secs to finish the execution since SetTimeout() function is set to return the execute the callback function after 3,000 ms i.e. 3 secs. But if we uncomment the fibonacci function which simlulates CPU intesive operation, callback function of the setTimeout() function return approx. 15 secs based on your computer's CPU power. It's because though both the operations started asychronously, the fibonacci function blocked the CPU, so the setTimeout() function from the same thread could not finish its execution on time. This is called Thread Startvation. So Node.js is good for database related longrunning operation which does not block the CPU but not very efficent if you are running concurrent CPU intesive operation using the single thread.  </p>
<pre>
    <code>
    /**
      * Run with and then without commenting out the CPU
      * intensive calculation part at the bottom.
      * With commenting out time elapsed is around 3 Secs.
      * Without commenting out time elapsed is approx 15 Secs depending on your machine's CPU power. 
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
    </code>
</pre>
<p>In the above discussion and example we saw Node.js is single threaded and optimized for single processor. Nonetheless, it is possible to utilize all the processor availble to a multi-core system using a module called "cluster" which is part of a core Node.js. Please, note that the processes do not share any common memory rather all inter process communications happen via IPC i.e. Inter Process Communication channel.</p>
<pre>
    <code>
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
           
        /** 
          * To exit uncomment the following two lines.
          * Don't exit if would like to keep the server running
          */
        //console.log(`Worker process ${process.pid} exiting.`);
        //process.exit();
               
        // Workers can share TCP connection
        http.createServer(function (req, res) {
                res.writeHead(200);
                res.end("Message from the worker: " + cluster.worker.process.pid);
            }).listen(8989);
        }
           
        /* Sample output:
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
        */    
    </code>
</pre>
<p>Anyway, it's better to use mutiple servers with a single processor using traditional load balancing system rather than using a single server with mutiple core. This is to avoid any overhead involved with creating and managing multiple worker processes.</p>
<p>----------------------------------------------------------</p>
<p>
Node.js Node.js® is a JavaScript runtime environment uses event driven non blocking I/O model via single thread which makes it light weight and efficient.
Whenever we have a function defined inside another function, the inner function has access to the variables declared in the outer function. The inner function can access the variables from the outer scope even after the outer function has returned.
</p>
<pre><code>
  function outerFunction(arg) {
    var variableInOuterFunction = arg;
    return function () {
        console.log(variableInOuterFunction);
    }
}

var innerFunction = outerFunction('hello closure!');

// Note the outerFunction has returned
innerFunction(); // logs hello closure!
</code></pre>

<p>
A programming language is said to have first-class functions if a function can be treated the same way as any other variable in the language. JavaScript has first-class functions.
</p>

<pre><code>
  //First class Function
function callback() {
	console.log ("I am the callback function");
}

var callbackFunc = callback;

function recevingFunction(callback) {
	setTimeout(callback, 3000);
}

recevingFunction(callbackFunc);
</code></pre>

<p>
Combine closures and first class function to achieve Node.js performance from a single thread execution. This is called Thread Startvation. So single thread Node.js is not ideal for high CPU intensive operation.
</p>

<pre><code>
  function longRunningOperation(callback) {
    // simulate a 3 second operation
    setTimeout(callback, 3000);
}

function webRequest(request) {
    console.log('starting a long operation for request:', request.id);
    longRunningOperation(function () {
        console.log('ending a long operation for request:', request.id);
    });
}
// simulate a web request
webRequest({ id: 1 });
// simulate a second web request
webRequest({ id: 2 });
</code></pre>

<p>
Thread starvation: Node.js is not the best option if you have a high CPU task that you need to do on a client request in a multiclient server environment. Node.js is great for data-intensive applications. As we have seen, using a single thread means that Node.js has an extremely low-memory footprint when used as a web server and can potentially serve a lot more requests. We know that gathering the data needed to respond to the client query takes a long time compared to executing code and/or reading data from RAM. All the work is going to be inside a single thread, which results in lesser memory consumption and, due to the lack of thread context switching, lesser CPU load. Node.js is not the best option if you have a high CPU task that you need to do on a client request in a multiclient server environment. 
</p>
<pre><code>
  // utility funcion
function fibonacci(n) {
    if (n < 2)
        return 1;
    else
        return fibonacci(n - 2) + fibonacci(n - 1);
}

// setup the timer
console.time('timer');
setTimeout(function () {
    console.timeEnd('timer'); // Prints much more than 1000ms
}, 1000)

// Start the long running operation
fibonacci(44);
</code></pre>

<p>
Node.js Clustering

As you know, Node.js is single-threaded, which means it is optimized for a single processor. However, it is not difficult to make our application utilize all the CPU cores available to us on a multi-core system. This is made simple for an HTTP server thanks to the clustering API, which is a part of core Node.js. We simply use it via require('cluster').

Other platforms have multi-threaded servers. Since a single Node.js process only has a single thread, we effectively need to look at multi-process servers. The main issue is that only a single process is allowed to listen on a particular port by the operating system. Otherwise, the OS would not know which process should get the packet received on a particular port. Therefore, we need a design where one process is the master (and actually listens on the TCP/IP port), and it spawns child processes and distributes the received HTTP traffic between them. This is exactly what the cluster module does.
</p>

<pre><code>
  var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    // Fork workers
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        console.log("Started a worker with pid: " + worker.process.pid);
    }

    // Listen to worker exiting
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' exited');
    });
} else {
    // Workers can share any TCP connection
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("Hello world from worker: " + cluster.worker.process.pid);
    }).listen(3000);
}
</code></pre>

<p>
Messaging
</p>
<pre><code>var cluster = require('cluster');
if (cluster.isMaster) {
    var worker = cluster.fork();
    worker.on('message', function(msg) {
        console.log('Message received from worker:', msg);
    })
} else {
    console.log('Worker started');
    process.send('Hello world!');
    process.exit();
}</code></pre>
<p>
As we have demonstrated, starting multiple Node.js HTTP processes to fully utilize the system resources is trivial. However, you are generally better off deploying multiple servers, each with a single CPU instead of a single server with multiple CPUs. Then you would distribute the load via a traditional load balancer, such as a reverse proxy like nginx (http://nginx.org/en/docs/http/load_balancing.html). It is still comforting to know that single server clustering is supported by Node.js.
</p>



