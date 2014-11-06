#!/usr/bin/env node
var s = require("child_process");
var cluster = new require("cluster");
var frequency = 121 // 50 Hz

var numWorkers = 3;
var nextWorker = 0;

InitializeI2C();

var x = 0;
if (cluster.isMaster)
{
	for (x = 0; x < numWorkers; x++)
	{
		cluster.fork();
	}

	var repetitions = 16;
	var index = 0;
	for (index = 0; index < repetitions; index++)
	{
		
		x = 0;
		for (var id in cluster.workers) 
		{
  	  if (x==nextWorker)
			{
				
				cluster.workers[id].send(index + " 60 120 1000 30");
				Sleep(1000);
			}
			x++;
    }
    nextWorker++;
    nextWorker = nextWorker%numWorkers;
    console.log(index + " " + nextWorker);
	}
	//for (var id in cluster.workers) {
	//    cluster.workers[id].kill();
	//}
}
else
{
	//chipAddress, regAddress, minDeg, maxDeg, duration, delay, workerNum
	var iterations = 32;
	var live = 1;
//	while (live)
//	{
		process.on('message', function(e)
		{
		    
		    var params = e.split(" ");
			var x = 0;
			var d = new Date();
			var endTime = parseInt(d.getTime()) + parseInt(params[3]);
			//console.log(e + " " + d.getTime() +" " + params[3] + " " + endTime);
			while (d.getTime() < endTime)
			//for (x = 0; x < 10; x ++)
			{
			    //console.log(d.getTime() + " " + endTime + " " + (d.getTime() < endTime));
				SendI2C(Math.floor(params[0]/16), params[0]%16, params[1]);
				Sleep(params[4]);
				SendI2C(Math.floor(params[0]/16), params[0]%16, params[2]);
				Sleep(params[4]);
				d = new Date();
			}
		});
//  }
}

function run()
{
	if (iterations >= 32) clearInterval(pid);
	RingBell(Math.floor(iterations/16), iterations%16, 60, 120, 6, 50);
	iterations++;
}

// SendI2C({0 or 1}, {0-15}, {0-180} degrees)
function SendI2C(chipAddress, regAddress, data)
{
	var raw = Math.floor(data * 386 / 180 + 145);
	var rawH = Math.floor(raw / 256);
	var rawL = raw % 256;
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (6 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (7 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (8 + 4*regAddress) + " " + rawL);
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (9 + 4*regAddress) + " " + rawH);
}

function InitializeI2C()
{
	//setup i2c
	s.exec("echo BB-I2C1 > /sys/devices/bone_capemgr.9/slots");
	//set mode to sleep
	s.exec("i2cset -y 2 0x40 0x00 0x11");
	s.exec("i2cset -y 2 0x41 0x00 0x11");
	//set frequency
	s.exec("i2cset -y 2 0x40 0xfe " + frequency);
	s.exec("i2cset -y 2 0x41 0xfe " + frequency);
	//set mode to normal
	s.exec("i2cset -y 2 0x40 0x00 0x01");
	s.exec("i2cset -y 2 0x41 0x00 0x01");
}


function Sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}