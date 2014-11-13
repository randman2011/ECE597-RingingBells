#!/usr/bin/env node
var s = require("child_process");

// RingBell({0 or 1}, {0-15}, {0-180} degrees, {0-180} degrees, even numbers, milliseconds)
onmessage = function RingBell(e)
{
//chipAddress, regAddress, minDeg, maxDeg, duration, delay
	var x = 0;
	var d = new Date();
	var endTime = d.getTime() + duration;
	while (d.getTime() < endTime);
	{
		SendI2C(e.data[0], e.data[1], e.data[2]);
		Sleep(e.data[5]);
		SendI2C(e.data[0], e.data[1], e.data[3]);
		Sleep(e.data[0]);
	}
	postMessage(e.data[6];
}
	
// SendI2C({0 or 1}, {0-15}, {0-180} degrees)
function SendI2C(chipAddress, regAddress, data)
{
	var raw = Math.floor(data * 386 / 180 + 175);
	var rawH = Math.floor(raw / 256);
	var rawL = raw % 256;
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (6 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (7 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (8 + 4*regAddress) + " " + rawL);
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (9 + 4*regAddress) + " " + rawH);
}

function Sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
