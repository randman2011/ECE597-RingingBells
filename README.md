The ringing bells project uses a BeagleBone Black and PWM cape to ring
multiple bells using servos.

Files:
* seti2c.sh - shell script that drives servos using hard-coded constants (Deprecated)
* RingBells.js - JavaScript script designed to drive multiple PWM outputs syncronously (Deprecated)
* RingerScript.c - compilable program that controls the operation of the BBB

Setup instructions:

1. Visit http://elinux.org/ECE597_Fall2014_Ringing_Servos to learn how to set up the hardware
2. Make project
3. Execute RingerScript
4. Wave hands in front of proximity sensor to trigger ringing bells
5. Set PWM registers to correct duty cycle for 1-2 ms pulse width
