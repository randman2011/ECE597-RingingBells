#include <errno.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "i2c-dev.h"
#include "i2cbusses.h"
#include "gpio-utils.h"
#include <pthread.h>
#include <signal.h>
#include <fcntl.h>
#include <poll.h>

#define NUM_BELLS 6
#define BELLS_PER 5
#define ANGLE 30

//int numWorkers = 2;
//int nextWorker = 0;
int keepgoing = 1;

void signal_handler(int sig);
void *ThreadFunction(void *param);
void SendI2C(int chipAddress, int bellNumber, int deg);
void InitI2C(void);

#define POLL_TIMEOUT (3*1000)
#define MAX_BUF 64

//signal handler function (to kill entire program cleanly)
void signal_handler(int sig){
  printf("Ctrl-C pressed, cleaning up and exiting...\n");
  keepgoing = 0;
}

void main(int argc, char *argv[])
{
  struct pollfd fdset[1];
  int nfds = 1, rc;
  int timeout;
  char buf[MAX_BUF];
  int i = 0;
  pthread_t threads[NUM_BELLS];
  
  signal(SIGINT, signal_handler);

  timeout = POLL_TIMEOUT;
  
  for(i = 0; i < NUM_BELLS; i++){
    pthread_create(&threads[i], NULL, ThreadFunction, &i);
  }

  while(keepgoing){
    memset((void*)fdset,0,sizeof(fdset));
    fdset[0].fd = STDIN_FILENO;
    fdset[0].events = POLLIN;

    rc = poll(fdset, nfds, timeout);

    if(fdset[0].revents & POLLPRI){
      (void)read(fdset[0].fd,buf,1);
      printf("\npoll() stdin read 0x%2.2X\n", (unsigned int) buf[0]);
    }
  }
  
  i = 0;
  while(i < NUM_BELLS){
    pthread_join(threads[i], NULL);
    i++;
  }
  
  //for (int x = 0; x < numWorkers; x++){
  //  pthread_create(&threads[x], NULL, ThreadFunction, NULL);
  // }
}

void *ThreadFunction(void *param){
  int ain = *(int*)param;
  int ain_value;
  int chipAddress = ain * 2 / NUM_BELLS - 1;
  int dir = 0, i;
  
  while(keepgoing){  //change this to some signal, sent by main program, to end
    ain_get_value(ain, &ain_value);
    if(ain_value > 1400){
      //don't ring
    } else{
      //ring
      
      if(dir){
	//go one direction
	for(i = 0; i < BELLS_PER; i++){
	  SendI2C(chipAddress, i + ain * 5, 90-ANGLE/2); 
	}
      }else{
	//go other direction
	for(i = 0; i < BELLS_PER; i++){
	  SendI2C(chipAddress, i + ain * 5, 90+ANGLE/2); 
	}
      }
      dir = (dir + 1) % 2;
    }
    usleep(ain_value * 500);
  }
}

void SendI2C(int chipAddress, int bellNumber, int deg){
  char buffer[50];
  int raw = deg * 386 / 180 + 145;
  int rawH = raw / 256;
  int rawL = raw % 256;
  
  sprintf(buffer, "i2cset -y 2 %d %d 0", 0x40 + chipAddress, 6 + bellNumber*4);
  system(buffer);
  sprintf(buffer, "i2cset -y 2 %d %d 0", 0x40 + chipAddress, 7 + bellNumber*4);
  system(buffer);
  sprintf(buffer, "i2cset -y 2 %d %d %d", 0x40 + chipAddress, 8 + bellNumber*4, rawL);
  system(buffer);
  sprintf(buffer, "i2cset -y 2 %d %d %d", 0x40 + chipAddress, 9 + bellNumber*4, rawH);
  system(buffer);
  //i2c_smbus_write_word_data(file, regAddress, raw);
}

void InitI2C(){
  //setup i2c
  system("echo BB-I2C1 > /sys/devices/bone_capemgr.*/slots");
  //set mode to sleep
  system("i2cset -y 2 0x40 0x00 0x11");
  system("i2cset -y 2 0x41 0x00 0x11");
  //set frequency (to 50 Hz)
  system("i2cset -y 2 0x40 0xfe 121");
  system("i2cset -y 2 0x41 0xfe 121");
  //set mode to normal
  system("i2cset -y 2 0x40 0x00 0x01");
  system("i2cset -y 2 0x41 0x00 0x01");
}
