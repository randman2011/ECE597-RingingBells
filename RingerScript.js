#!/usr/bin/env node
var s = require("child_process");
var cluster = new require("cluster");
var frequency = 121 // 50 Hz

var numWorkers = 3;
var nextWorker = 0;

var f1 = function SendI2C(e)
{
	console.log("SendI2C");
	var params = e.split(" ");
	var chipAddress = params[0];
	var regAddress = params[1];
	var data = params[2];
	var raw = Math.floor(data * 386 / 180 + 145);
	var rawH = Math.floor(raw / 256);
	var rawL = raw % 256;
	console.log(chipAddress + " " + regAddress + " " + data);
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (6 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (7 + 4*regAddress) + " 0x00");
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (8 + 4*regAddress) + " " + rawL);
	s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (9 + 4*regAddress) + " " + rawH);
}

InitializeI2C();

var x = 0;
if (cluster.isMaster)
{
	for (x = 0; x < numWorkers; x++)
	{
		cluster.fork();
	}

	var repetitions = 4;
	var index = 0;
	setInterval(function()
	{
		index = index%repetitions;
		x = 0;
		for (var id in cluster.workers) 
		{
  	  if (x==nextWorker)
			{
				cluster.workers[id].send(index + " 60 120 1000 30");
			}
			break;
    }
    nextWorker++;
    nextWorker = nextWorker%numWorkers;
    index++;
	}, 500);
}
else
{
	//chipAddress, regAddress, minDeg, maxDeg, duration, delay
	//var iterations = 4;
		process.on('message', function(e)
		{
		    
		  var params = e.split(" ");
			var s1 = setInterval(function()
				{
					//var params = e.split(" ");
					var chipAddress = Math.floor(params[0]/16);
					var regAddress = params[0]%16;
					var data = params[1];
					var raw = Math.floor(data * 386 / 180 + 145);
					var rawH = Math.floor(raw / 256);
					var rawL = raw % 256;
					console.log(chipAddress + " " + regAddress + " " + data);
					s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (6 + 4*regAddress) + " 0x00");
					s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (7 + 4*regAddress) + " 0x00");
					s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (8 + 4*regAddress) + " " + rawL);
					s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (9 + 4*regAddress) + " " + rawH);
				}, params[4]);
			var s2 = setInterval(function()
				{
					//var params = e.split(" ");
					var chipAddress = Math.floor(params[0]/16);
					var regAddress = params[0]%16;
					var data = params[2];
					var raw = Math.floor(data * 386 / 180 + 145);
					var rawH = Math.floor(raw / 256);
					var rawL = raw % 256;
					console.log(chipAddress + " " + regAddress + " " + data);
					s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (6 + 4*regAddress) + " 0x00");
					s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (7 + 4*regAddress) + " 0x00");
					s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (8 + 4*regAddress) + " " + rawL);
					s.exec("i2cset -y 2 " + (0x40 + chipAddress) + " " + (9 + 4*regAddress) + " " + rawH);
					flag = true;
				}, params[4]*2);
			setTimeout(function() { 
				clearTimeout(s1);
				clearTimeout(s2);
			}, params[3]);
		});
//  }
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


