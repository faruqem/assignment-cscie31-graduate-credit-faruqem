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
