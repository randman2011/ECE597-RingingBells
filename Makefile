TOOLS_CFLAGS	:= -Wstrict-prototypes -Wshadow -Wpointer-arith -Wcast-qual \
		   -Wcast-align -Wwrite-strings -Wnested-externs -Winline \
		   -W -Wundef -Wmissing-prototypes

LDFLAGS		:= -pthread

CFLAGS		:= -lpthread

#
# Programs
#
all:	readanalog RingerScript

readanalog:  readanalog.o gpio-utils.o
	$(CC) $(LDFLAGS) -o $@ $^

RingerScript:	RingerScript.o gpio-utils.o i2cbusses.o
	$(CC) $(LDFLAGS) -o $@ $^

#
# Objects
#

%.o: %.c
	$(CC) $(CFLAGS) $(TOOLS_CFLAGS) -c $< -o $@

clean:
	rm *.o readanalog RingerScript
