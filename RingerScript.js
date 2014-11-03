#!/usr/bin/env node
var s = require("child_process");
var frequency = 121 // 50 Hz

var numWorkers = 3;

var workerArray = new Array(numWorkers);
var workerBusy = new Array(numWorkers);

var x = 0;
for (x = 0; x < numWorkers; x++)
{
	workerArray[x] = new Worker("BellScript.js");
	workerBusy[x] = 0;
}

//chipAddress, regAddress, minDeg, maxDeg, duration, delay, workerNum
var iterations = 32;
var pid = setInterval(run, 500);

function run()
{
	if (iterations >= 32) clearInterval(pid);
	RingBell(Math.floor(iterations/16), iterations%16, 60, 120, 6, 50);
	iterations++;
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
