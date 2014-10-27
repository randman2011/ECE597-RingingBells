#!/usr/bin/env node
//var b = require('bonescript'); 
var s = require("child_process");

var frequency = 121 // 50 Hz
var iterations = 0;
InitializeI2C();
var pid = setInterval(run, 50);


function run()
{
	if (iterations >= 32) clearInterval(pid);
	RingBell(Math.floor(iterations/16), iterations%16, 60, 120, 6, 50);
	iterations++;
}

// RingBell({0 or 1}, {0-15}, {0-180} degrees, {0-180} degrees, even numbers, milliseconds)
function RingBell(chipAddress, regAddress, minDeg, maxDeg, numRings, delay)
{
	var x = 0;
	for (x=0;x<numRings/2;x++)
	{
		sendI2C(chipAddress, regAddress, minDeg);
		Sleep(delay);
		sendI2C(chipAddress, regAddress, maxDeg);
		Sleep(delay);
	}
}
	
// SendI2C({0 or 1}, {0-15}, {0-180} degrees)
function SendI2C(chipAddress, regAddress, data)
{
	var raw = data * 386 / 180 + 175;
	var rawH = Math.floor(raw / 256);
	var rawL = raw % 256;
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (6 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (7 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (8 + 4*regAddress) + " " + rawL);
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (9 + 4*regAddress) + " " + rawH);
}

function InitializeI2C()
{
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
