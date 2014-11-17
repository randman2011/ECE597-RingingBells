#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include "gpio-utils.h"

#define BELLS 6

int main(int argc, char** argv)
{
	int i;
	int ain_val[BELLS];
	
	while(1)
	{
    	for(i = 0; i < BELLS; i++)
    	{
    	    ain_get_value(i, &ain_val[i]);
    	    printf("%d ", ain_val[i]);
    	}
    	
    	printf("\n");
    	
    	usleep(100000);
	}
	
	return 0;
}