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
#define BELLS_PER 4
#define ANGLE 30      //degrees peak-to-peak
#define DELAY 15000   //microseconds
#define SPEED_ADJUST 1  //1 - speed adjusts based on distance from sensor

//int numWorkers = 2;
//int nextWorker = 0;
int keepgoing = 1;

void signal_handler(int sig);
void *ThreadFunction(void *param);
void SendI2C(int chipAddress, int bellNumber, int deg);
void InitI2C(void);
void InitAIN(void);

#define POLL_TIMEOUT (3*1000)
#define MAX_BUF 64

typedef struct Thread{
  pthread_t tid;
  int id;
  pthread_mutex_t mutex;
} Thread;

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
  pthread_mutex_t i2c_mutex;
  Thread threads[NUM_BELLS];
  
  signal(SIGINT, signal_handler);

  timeout = POLL_TIMEOUT;
  
  InitI2C();
  InitAIN();
  
  pthread_mutex_init(&i2c_mutex,NULL);

  for(i = 0; i < NUM_BELLS; i++){
    threads[i].id = i;
    threads[i].mutex = i2c_mutex;
    pthread_create(&threads[i].tid, NULL, ThreadFunction, (threads+i));
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
    pthread_join(threads[i].tid, NULL);
    i++;
  }
}

void *ThreadFunction(void *param){
  Thread *t = param;
  int ain = t->id;
  pthread_mutex_t i2c_mutex = t->mutex;
  int ain_value;
  int chipAddress = ain * 2 / NUM_BELLS;
  int bell = (ain - chipAddress*NUM_BELLS/2) * BELLS_PER;
  int dir = 0, i;
  
  printf("Thread %d chipAddress %d ain %d\n", ain, chipAddress, ain);
  
  while(keepgoing){  //change this to some signal, sent by main program, to end
    ain_get_value(ain, &ain_value);
    if(ain_value > 1000){
      //don't ring
    } else{
      //ring
      
      if(dir){
	      //go one direction
	      for(i = 0; i < BELLS_PER; i++){
	        pthread_mutex_lock(&i2c_mutex);
	        SendI2C(chipAddress, i + bell, 90-ANGLE/2); 
	        //usleep(1000);
	        pthread_mutex_unlock(&i2c_mutex);
	      }
      }else{
	      //go other direction
	      for(i = 0; i < BELLS_PER; i++){
	        pthread_mutex_lock(&i2c_mutex);
	        SendI2C(chipAddress, i + bell, 90+ANGLE/2);
	        //usleep(1000);
	        pthread_mutex_unlock(&i2c_mutex);
	      }
      }
      
      dir = (dir + 1) % 2;
    }
    if(SPEED_ADJUST){
      usleep(ain_value * 250);
    } else {
      usleep(DELAY);
    }
  }
}

void SendI2C(int chipAddress, int bellNumber, int deg){
  char buffer[50];
  int raw = deg * 386 / 180 + 145;
  int rawH = raw / 256;
  int rawL = raw % 256;
  
  //sprintf(buffer, "i2cset -y 2 %d %d 0", 0x40 + chipAddress, 6 + bellNumber*4);
  //system(buffer);
  //printf("%s\n", buffer);
  //sprintf(buffer, "i2cset -y 2 %d %d 0", 0x40 + chipAddress, 7 + bellNumber*4);
  //system(buffer);
  //printf("%s\n", buffer);
  sprintf(buffer, "i2cset -y 2 %d %d %d", 0x40 + chipAddress, 8 + bellNumber*4, rawL);
  system(buffer);
  //printf("%s\n", buffer);
  sprintf(buffer, "i2cset -y 2 %d %d %d", 0x40 + chipAddress, 9 + bellNumber*4, rawH);
  system(buffer);
  //printf("%s\n", buffer);
  //i2c_smbus_write_word_data(file, regAddress, raw);
}

void InitI2C(){
  //setup i2c
  system("echo BB-I2C1 > /sys/devices/bone_capemgr.9/slots");
  printf("echo BB-I2C1 > /sys/devices/bone_capemgr.9/slots\n");
  //usleep(10000);
  //set mode to sleep
  system("i2cset -y 2 0x40 0x00 0x11");
  printf("i2cset -y 2 0x40 0x00 0x11\n");
  system("i2cset -y 2 0x41 0x00 0x11");
  printf("i2cset -y 2 0x41 0x00 0x11\n");
  //set frequency (to 50 Hz)
  system("i2cset -y 2 0x40 0xfe 121");
  printf("i2cset -y 2 0x40 0xfe 121\n");
  system("i2cset -y 2 0x41 0xfe 121");
  printf("i2cset -y 2 0x41 0xfe 121\n");
  //set mode to normal
  system("i2cset -y 2 0x40 0x00 0x01");
  printf("i2cset -y 2 0x40 0x00 0x01\n");
  system("i2cset -y 2 0x41 0x00 0x01");
  printf("i2cset -y 2 0x41 0x00 0x01\n");
}

void InitAIN(){
  system("echo cape-bone-iio > /sys/devices/bone_capemgr.9/slots");
  printf("echo cape-bone-iio > /sys/devices/bone_capemgr.9/slots\n");
}

