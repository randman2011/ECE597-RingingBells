The ringing bells project uses a BeagleBone Black and PWM cape to ring
multiple bells using servos.

Setup instructions:
1. Enable I2C1 with echo BB-I2C1 > slots
2. Set PWM cape frequency while still in sleep mode
3. Set cape to normal mode
4. Set PWM registers to correct duty cycle for 1-2 ms pulse width
