#!/usr/bin/env node
//var b = require('bonescript'); 
var s = require("child_process");
var util = require("util");

var frequency = 121 // 50 Hz
var iterations = 0;
InitializeI2C();
var pid = setInterval(run, 50);


function run()
{
	if (iterations >= 32) clearInterval(pid);
	//util.print("blah\n");
	RingBell(Math.floor(iterations/16), iterations%16, 60, 120, 6, 50);
	iterations++;
}

// RingBell({0 or 1}, {0-15}, {0-180} degrees, {0-180} degrees, even numbers, milliseconds)
function RingBell(chipAddress, regAddress, minDeg, maxDeg, numRings, delay)
{
	var x = 0;
	for (x=0;x<numRings/2;x++)
	{
		SendI2C(chipAddress, regAddress, minDeg);
		Sleep(delay);
		SendI2C(chipAddress, regAddress, maxDeg);
		Sleep(delay);
		//util.print(util.format("ringbell %d %d %d %d %d %d\n", chipAddress, regAddress,minDeg,maxDeg,numRings,delay));
	}
}
	
// SendI2C({0 or 1}, {0-15}, {0-180} degrees)
function SendI2C(chipAddress, regAddress, data)
{
<<<<<<< HEAD
	var raw = Math.floor(data * 386 / 180 + 175);
=======
	var raw = Math.floor(data * 386 / 180 + 145);
>>>>>>> 8de4693bb78be426a824ef333f6f419cdb86255c
	var rawH = Math.floor(raw / 256);
	var rawL = raw % 256;
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (6 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (7 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (8 + 4*regAddress) + " " + rawL);
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (9 + 4*regAddress) + " " + rawH);
	//util.print(util.format("ringbell %d %d %d %d\n", 0x40 + chipAddress, (6 + 4*regAddress), rawH, rawL));
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
