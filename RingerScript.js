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

	x = 0;
	var repetitions = 10;
	var index = 0;
	for (index = 0; index < repetitions; index++)
	{
		for (var id in cluster.workers) {
  	  if (x==nextWorker)
			{
				cluster.workers[id].send('message', {nextWorker, 60, 120, 6, 50});
				(nextWorker++)%numWorkers;
				//Sleep(50);
			}
  	}
	}
}
else
{
	//chipAddress, regAddress, minDeg, maxDeg, duration, delay, workerNum
	var iterations = 32;
	var live = 1;
	while (live)
	{
		process.on('message', function(motor, minDeg, maxDeg, numRings, delay)
		{
			var x = 0;
			var d = new Date();
			var endTime = d.getTime() + duration;
			while (d.getTime() < endTime);
			{
				SendI2C(Math.floor(motor/16), motor%16, minDeg);
				Sleep(delay);
				SendI2C(Math.floor(motor/16), motor%16, maxDeg);
				Sleep(delay);
			}
		}		
		process.on('kill', function(e)
		{
			live = 0;
		}	
	}
}

function run()
{
	if (iterations >= 32) clearInterval(pid);
	RingBell(Math.floor(iterations/16), iterations%16, 60, 120, 6, 50);
	iterations++;
}

function RingBell(chipAddress, regAddress, minDeg, maxDeg, numRings, delay)
{
	var x = 0;
	var d = new Date();
	var endTime = d.getTime() + duration;
	while (d.getTime() < endTime);
	{
		SendI2C(chipAddress, regAddress, minDeg);
		Sleep(delay);
		SendI2C(chipAddress, regAddress, maxDeg);
		Sleep(delay);
	}
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

onmessage = function(e)
{
	workerBusy[e.data] = 0;
}
