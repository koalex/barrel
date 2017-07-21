/*****************************************************
This program was produced by the
CodeWizardAVR V2.05.0 Professional
Automatic Program Generator
© Copyright 1998-2010 Pavel Haiduc, HP InfoTech s.r.l.
http://www.hpinfotech.com

Project : 
Version : 
Date    : 11.06.2017
Author  : NeVaDa
Company : 
Comments: 


Chip type               : ATmega32L
Program type            : Application
AVR Core Clock frequency: 1,843200 MHz
Memory model            : Small
External RAM size       : 0
Data Stack size         : 256
*****************************************************/

#include <mega32.h>
#include <sleep.h>
#include <delay.h>

#define RESET_ESP PORTD.3
// Standard Input/Output functions
#include <stdio.h>
#define EEP_BUFF 110
volatile unsigned long int ctrl_timestamp=0, timestamp=0;
volatile unsigned long int data_f=0;
volatile char flags_err_timestamp=0; // флаг указывающий на ошибку получения таймсемп .
volatile char timer_reset=0, flags_fills=0;
volatile unsigned char flg=0;        // cmd work
volatile unsigned char min0=50, cmd_repeat=0; // repeat 30s cmd (fills, timestamp, pings)

eeprom unsigned long int eep_ts[EEP_BUFF];
eeprom unsigned long int eep_fills[EEP_BUFF];
eeprom unsigned char eep_err_ts[EEP_BUFF];

void sleep_en()
{
    sleep_enable(); //Разрешение на спящий режим 
    powersave();//powersave(); // режим энергосбережения
}

void sleep_start(char x)
{
    flg&=~x;
}


// External Interrupt 0 service routine
interrupt [EXT_INT0] void ext_int0_isr(void)
{
 sleep_disable(); 
 //printf("SLEEP OFF INT\r\n");
  data_f++; // считаем в микролитрах  // сенсор считает на 1 импульс - 0.46мл
  flags_fills=1;
  
  ctrl_timestamp = timestamp; // фиксируем таймстемп
  //sleep_en();
}

#ifndef RXB8
#define RXB8 1
#endif

#ifndef TXB8
#define TXB8 0
#endif

#ifndef UPE
#define UPE 2
#endif

#ifndef DOR
#define DOR 3
#endif

#ifndef FE
#define FE 4
#endif

#ifndef UDRE
#define UDRE 5
#endif

#ifndef RXC
#define RXC 7
#endif

#define FRAMING_ERROR (1<<FE)
#define PARITY_ERROR (1<<UPE)
#define DATA_OVERRUN (1<<DOR)
#define DATA_REGISTER_EMPTY (1<<UDRE)
#define RX_COMPLETE (1<<RXC)

// USART Receiver buffer
#define RX_BUFFER_SIZE 512
char rx_buffer[RX_BUFFER_SIZE];

#if RX_BUFFER_SIZE <= 256
unsigned char rx_wr_index,rx_rd_index,rx_counter;
#else
unsigned int rx_wr_index,rx_rd_index,rx_counter;
#endif

#define IP_SRV "188.225.32.111"
#define PORT_SRV "5000" //"5000"7771
#define READ_BUFFER "500"

eeprom unsigned int demo_mode=0;
eeprom unsigned char eep_id[]={0x11,0x00,0xEF,0x1A};
eeprom unsigned char eep_flags=0;

//eeprom char eep_wifi_ssid[32]="Suvorova8";
//eeprom char eep_wifi_psw[32]="1234567890";
//volatile char wifi_ssid[32];
//volatile char wifi_psw[32];
       
char sta_data[100]; // ip,ssid модуля и другие параметры

flash char conn_to_wifi_[]="ATPN=\"ASUS\",kolbasa123\r\n";  //"ATPN=\"%s\",%s\r\n", wifi_ssid , wifi_psw   
//flash char conn_to_wifi_[]="ATPN=\"Telemasterskaya\",0954110711\r\n";  //"ATPN=\"%s\",%s\r\n", wifi_ssid , wifi_psw     
flash char tcp_conn1[]="ATPC=0,"IP_SRV","PORT_SRV"\r\n";



//eeprom char eep_ip_srv[24]="92.53.124.189";
//volatile char ip_srv[24]="92.53.124.189"; // ip ram memory

//flash char tcp_conn2[]=","PORT_SRV"\r\n"; // ATPC=0,192.168.0.26,5555

flash char tcp_read[]="ATPR=";
flash char tcp_read1[]=","READ_BUFFER"\r\n";
flash char tcp_send1[]="ATPT="; // ATPT=<колл. данных>,<id>:<data>  // send data
//flash char tcp_send2[]=",0:";


unsigned char sek=0, min=0, h=1;
volatile char  sek_buff=100, vcc=0, conn_id_t=0;

flash char http_post_data0[]="POST /api/v1/fills HTTP/1.1\r\nHost: "IP_SRV":"PORT_SRV"\r\nAccept: */*\r\nContent-Type: application/json\r\nContent-Length: ";
flash char http_post_data1[]="\r\n\r\n"; 


flash char json_data_sn[]="{\"sn\":\"";    // данные наливов и таймстемп
flash char json_data_dt[]="\",\"dt\":";
flash char json_data_ctrl_dt[]=",\"ctrl_dt\":";
flash char json_data_f[]=",\"f\":";
flash char json_data_vcc[]=",\"vcc\":";
flash char json_data_end[]=",\"dt_c\":";

flash char http_get_timestamp[]="GET /api/v1/server_timestamp HTTP/1.1\r\nHost: "IP_SRV":"PORT_SRV"\r\nAccept: */*\r\nContent-Type: application/json\r\nContent-Length: 0\r\n\r\n";

flash char http_set_pings[]="POST /api/v1/pings HTTP/1.1\r\nHost: "IP_SRV":"PORT_SRV"\r\nAccept: */*\r\nContent-Type: application/json\r\nContent-Length: ";
  
flash char http_set_pings1[]=",\"ctrl\":\"fw_2.0,c_RTL8710,b_2.0,";
 // >>>>   ip data
// >>>>> ssid data
flash char http_set_pings3[]="\",\"f_s\":{\"s\":{}},\"dt_c\":";
// >>>>> timestamp status 0...2
//flash char http_set_pings4[]="}";

// This flag is set on USART Receiver buffer overflow
bit rx_buffer_overflow;

// USART Receiver interrupt service routine
interrupt [USART_RXC] void usart_rx_isr(void)
{
char status,data;
status=UCSRA;
data=UDR;
if ((status & (FRAMING_ERROR | PARITY_ERROR | DATA_OVERRUN))==0)
   {
   rx_buffer[rx_wr_index++]=data;
#if RX_BUFFER_SIZE == 256
   // special case for receiver buffer size=256
   if (++rx_counter == 0)
      {
#else
   if (rx_wr_index == RX_BUFFER_SIZE) rx_wr_index=0;
   if (++rx_counter == RX_BUFFER_SIZE)
      {
      rx_counter=0;
#endif
      rx_buffer_overflow=1;
      }
   }
}

#ifndef _DEBUG_TERMINAL_IO_
// Get a character from the USART Receiver buffer
#define _ALTERNATE_GETCHAR_
#pragma used+
char getchar(void)
{
char data;
while (rx_counter==0);
data=rx_buffer[rx_rd_index++];
#if RX_BUFFER_SIZE != 256
if (rx_rd_index == RX_BUFFER_SIZE) rx_rd_index=0;
#endif
#asm("cli")
--rx_counter;
#asm("sei")
return data;
}
#pragma used-
#endif



#define ADC_VREF_TYPE 0x20

// Read the 8 most significant bits
// of the AD conversion result
unsigned char read_adc(unsigned char adc_input)
{
ADMUX=adc_input | (ADC_VREF_TYPE & 0xff);
// Delay needed for the stabilization of the ADC input voltage
delay_us(10);
// Start the AD conversion
ADCSRA|=0x40;
// Wait for the AD conversion to complete
while ((ADCSRA & 0x10)==0);
ADCSRA|=0x10;
return ADCH;
}

// Timer2 overflow interrupt service routine
interrupt [TIM2_OVF] void timer2_ovf_isr(void)
{
static char min1=5;
//static unsigned int timer=0; 
sleep_disable();
//printf("SLEEP OFF\r\n");
//  if(++timer>1) 
//  {
//     timer=0; 
   timestamp++;
   if(flags_fills==0){ min0=0;}
   if(flags_fills) { min0++; }
   if(++sek_buff>250)sek_buff=251;
       if(++sek>59)
       {
        min++;  sek=0; min1++; 
        //flags_fills=1; // устанавливаем флаг для отправки наливов
       } 
       if(min>59)
       { 
        min=0;
         if(++h>100)
         h=0; 
       }
 // } 
  
   if(h>4) // обновляем таймстемп
   { 
    flg|=0x01;
     h=0; 
       timer_reset=0;
       cmd_repeat&=~0x01;
   }
   if(((min0>20) && flags_fills) || (sek_buff>19 && sek_buff<22 && eep_flags)) // отсылаем наливы через 20 сек
   { 
    flg|=0x02;
     min0=0; 
     sek_buff=100;
       timer_reset=0;
       flags_fills=0;
   }
   if(min1>4) // send pings
   {
    flg|=0x04;
    min1=0;
      timer_reset=0;
      cmd_repeat&=~0x04;
   }
   if(flg==0)
   {
    RESET_ESP=1;
    //printf("SLEEP\r\n");                   
    sleep_en();
   }

}
void clear_buffer_rx()
{
           int x_=0;
          for(x_=0; x_<RX_BUFFER_SIZE; x_++) rx_buffer[x_]=0;  
               rx_counter=0;     
               rx_wr_index=0;   
}

void reset_chip()
{
        clear_buffer_rx(); 
       RESET_ESP=1;
        delay_ms(100);
       RESET_ESP=0; // RESET ESP OFF    
        delay_ms(500);
//          printf("ATSR\r\n"); // [ATSR] OK
//   while(x)
//    {
//     delay_ms(100);
//    if(string_search("[ATSR] OK",rx_buffer)){ x=0;} // ищем ответ модуля
//    if(x)x--;  // счетчик периода опроса модуля
//    }
//    //clear_buffer_rx();
//           delay_ms(3000);
}
char reads(unsigned long int data)
{
if(data<10)return 1;
else if(data<100)return 2;
else if(data<1000)return 3;
else if(data<10000)return 4;
else if(data<100000)return 5;
else if(data<1000000)return 6;
else if(data<10000000)return 7;
else if(data<100000000)return 8;
else if(data<1000000000)return 9;
else if(data<10000000000)return 10;
else return 11;
}


int string_search(char *str1,char *str2)
{
unsigned int addr=0,x=0,y=0;
str1+=0;
str2+=0;

while(str1[addr]!=0)
{
 addr++;
}

while(str1[y]!=0 && str2[x]!=0)
{
if(str1[y] == str2[x])
{
 y++;
 x++; 
}
else
{
 if(y<addr)y=0; 
 x++;  // указатель последнего символа искомой строки
}
//printf("Y=%d,X=%d,ADDR=%d, str1=%c , str2=%c \r\n" , y,x,addr,str1[y] , str2[x]);
}

//printf("Y=%d,X=%d,ADDR=%d\r\n" , y,x,addr);

if(y && (addr==y))return x; // проверить код! Возвращает указатель конца найденной строки
return 0;
}

char answer()
{
char x=1;
         while(x)
         { 
           if(string_search("no change",rx_buffer))x=0;
           else if(string_search("OK",rx_buffer))x=0;
             else if(string_search("WIFI CONNECTED",rx_buffer))x=0;
           //else if(string_search("ERROR",rx_buffer)) {clear_buffer_rx(); return 1;}
           else
           {
            delay_ms(250);
            if(++x>50){ clear_buffer_rx(); return 1; }
           }
         }
         clear_buffer_rx();
          delay_ms(250);
          return 0;
}
char at_start()
{
char x=20;
while(x)
{
 delay_ms(200);
     if(string_search("READY",rx_buffer))return 1;
     x--; 
}
return 0;
}
char read_http_status()
{
char x=20;
int addr_ans=0, buff[3];
 while(x)
 {
  delay_ms(1000);
   addr_ans = string_search("HTTP/1.1 ",rx_buffer); // получаем указатель на код ответа от сервера 
   if(addr_ans)
   {
    buff[0] = (rx_buffer[addr_ans]-48);
    buff[0]*=100;
    buff[1] = (rx_buffer[addr_ans+1]-48);
    buff[1]*=10;
    buff[2] = (rx_buffer[addr_ans+2]-48);
    buff[0] = buff[0]+buff[1]+buff[2]; 
     if(buff[0]>199 && buff[0]<300) // status ok!
     {
       printf("SS_OK:%i\r\n" , buff[0]);
      delay_ms(1000);
      x=0; 
      addr_ans=0;
        return 0;
     }
     else
     {
      printf("SS:%i\r\n" , buff[0]);
       delay_ms(1000);
       return 1; 
     }
   }
   x--;
                       
    if(x<2)
     { 
      printf("STRN\r\n");
      delay_ms(1000);
      //sleep_en();
       return 2;
     } 
 }
}

char wifi_status()
{
char x=0;
 printf("ATW?\r\n");
 x=60;
 while(x)
 {
  delay_ms(100);
  if(string_search("STA,",rx_buffer))return 0; 
  // тут нужно вставить имя сети из еепром
  if(string_search("0.0.0.0",rx_buffer))return 1; // ошибка получения ай-пи
  if(x)x--;
 }
 return 2; // error
}

char wifi_disconnect()
{
char x=0;
 printf("ATWD\r\n");
 x=60;
 while(x)
 {
   delay_ms(100);
  if(string_search("[ATWD] OK",rx_buffer))return 0;
  if(x)x--;
 }
 return 1; // error
}

char conn_to_wifi()
{
char x=100;// таймаут опроса модуля 100х100мс = 10 сек.

clear_buffer_rx();
reset_chip();
delay_ms(700);
printf(conn_to_wifi_); // ATPA=<ssid>,<pwd>,<chl>,<hidden>[,<max_conn>]
 while(x)
 {
   delay_ms(200);
  if(string_search("[ATPN] OK",rx_buffer)){ delay_ms(1000); return 0;} // ищем ответ модуля 
  if(string_search("ERROR",rx_buffer)){ clear_buffer_rx(); printf(conn_to_wifi_); delay_ms(1000); x=100;}
  if(x)x--;  // счетчик периода опроса модуля
 }
 clear_buffer_rx();
 return 1; // error
}
void tcp_conn() // подкл. к серверу
{
char x=100;
  delay_ms(1000); 
   clear_buffer_rx();
  printf(tcp_conn1); 
while(x)
 {
  x--;
  delay_ms(200);
  if(string_search("con_id=",rx_buffer))
  { 
   conn_id_t = (string_search("con_id=",rx_buffer));
   conn_id_t = rx_buffer[ conn_id_t ];
   x=0;
  } 
  else if(string_search("ERROR",rx_buffer))
  {
   conn_id_t = rx_buffer[string_search("ERROR:",rx_buffer)];
   printf("ERROR:%c\r\n", conn_id_t); 
   conn_id_t='0';
   x=0;
  }
  
 }
  delay_ms(1000);
}

void read_tcp_data()// чтение данных
{
             delay_ms(700);
             clear_buffer_rx();
             printf(tcp_read);
             printf("%c", conn_id_t);
             printf(tcp_read1);
             delay_ms(500);
}
char transfer() // fills
{
char x=1; 
char id[4];

   if(flg&0x02) reset_chip();
     
    timer_reset=0;
    
    // отправляем команду получения ай-пи
    if(conn_to_wifi()==0)
     {
        vcc = read_adc(0); 
         tcp_conn();
         printf(tcp_send1);
         printf("%d", (2 + 1 + (sizeof(json_data_vcc)-1) + (sizeof(http_post_data0)-1) + (sizeof(http_post_data1)-1) + (sizeof(json_data_sn)-1) + (sizeof(json_data_ctrl_dt)-1) + (sizeof(json_data_f)-1) + (sizeof(json_data_dt)-1) + (sizeof(json_data_end)-1) + 10 + reads(timestamp) + reads(ctrl_timestamp)+ reads(data_f) + reads(vcc/20) + reads(vcc%20)));               
         printf(",%c:", conn_id_t);
         timer_reset=0;
         while(x)
         {
            delay_ms(50); 

            clear_buffer_rx();
            
                printf(http_post_data0);  
                printf("%i", (9 + 1 + (sizeof(json_data_vcc)-1) + reads(ctrl_timestamp) + reads(timestamp) + reads(data_f) + 28 + (sizeof(json_data_ctrl_dt)-1) + reads(vcc/20) + reads(vcc%20))); // размер данных json
                
                printf(http_post_data1);
                
                 printf(json_data_sn);
                 for(x=0; x<4; x++){ id[x] = eep_id[x]; printf("%02X",id[x]);}
                 printf(json_data_dt);
                 printf("%lu",timestamp);
                 printf(json_data_ctrl_dt);
                 printf("%lu",ctrl_timestamp); // timestamp во время наливов
                 printf(json_data_f);
                 printf("%lu",data_f);
                 printf(json_data_vcc);
                 printf("%d.%d", vcc/20, vcc%20);
                 printf(json_data_end);
                   printf("%d}",flags_err_timestamp);
              delay_ms(700);  
             read_tcp_data();
             delay_ms(700);
              if(read_http_status()==0) {data_f=0; clear_buffer_rx(); return 0;} // No error
             else
             {
              RESET_ESP=1;
              x=1; 
              //eep_flags=1; // set flags err
              if(data_f)
               {
                while(x)
                {  

                  if(eep_ts[x-1]==0 || eep_ts[x-1]==0xFFFFFFFF)
                  {
                   eep_ts[x-1]=ctrl_timestamp;
                   eep_fills[x-1]=data_f;
                   eep_err_ts[x-1]=flags_err_timestamp;
                   data_f=0;
                   
                   eep_flags=x;
                   x=0;
                  }
                  else
                  {
                   x++;
                   if(x>(EEP_BUFF-1))
                   {
                    x=1;
                    eep_ts[x-1]=ctrl_timestamp;
                    eep_fills[x-1]=data_f;
                    eep_err_ts[x-1]=flags_err_timestamp;
                    data_f=0;
                    x=0;
                   }
                  }
                }
              }
                 sleep_start(0x02); 
                 return 0;
             }
             x=0;
         }
     }
     else
     { 
       printf("E11\r\n");
       delay_ms(50);
       RESET_ESP=1;
       x=1; 
          if(data_f)
           {
              while(x)
              {
                  if(eep_ts[x-1]==0 || eep_ts[x-1]==0xFFFFFFFF)
                  {
                   eep_ts[x-1]=ctrl_timestamp;
                   eep_fills[x-1]=data_f;
                   eep_err_ts[x-1]=flags_err_timestamp;
                   data_f=0;
                   
                   eep_flags=x; // save cnt data
                   x=0;
                  }
                  else
                  {
                   x++;

                   if(x>(EEP_BUFF-1))
                   {
                    x=1;
                    eep_ts[x-1]=ctrl_timestamp;
                    eep_fills[x-1]=data_f; 
                    eep_err_ts[x-1]=flags_err_timestamp;
                    data_f=0;
                    x=0;
                   }
                  }
              }
           }
       sleep_start(0x02); 
      return 0;
     }  
        delay_ms(600);      
}
char fills_buff()
{
static unsigned long int data_f_buff=0, data_ts_buff=0;
static char cnt_=0, flags_err_ts=0;
 if(eep_flags)
 {
  char x=1; 
  char id[4];
  printf("FBS=%d\r\n", eep_flags);
   if(flg&0x02) reset_chip();
     
    timer_reset=0;
    
    // отправляем команду получения ай-пи
    if(conn_to_wifi()==0)
     {
        vcc = read_adc(0); 
        #asm("cli")
           cnt_= (eep_flags-1);
        data_f_buff = eep_fills[cnt_]; // копируем в ОЗУ данные из еепром 
        data_ts_buff = eep_ts[cnt_];
        flags_err_ts=eep_err_ts[cnt_]; 
        #asm("sei") 
        
         tcp_conn();
         printf(tcp_send1);
         printf("%d", (2 + 1 + (sizeof(json_data_vcc)-1) + (sizeof(http_post_data0)-1) + (sizeof(http_post_data1)-1) + (sizeof(json_data_sn)-1) + (sizeof(json_data_ctrl_dt)-1) + (sizeof(json_data_f)-1) + (sizeof(json_data_dt)-1) + (sizeof(json_data_end)-1) + 10 + reads(timestamp) + reads(ctrl_timestamp)+ reads(data_f_buff) + reads(vcc/20) + reads(vcc%20)));               
         printf(",%c:", conn_id_t);
         timer_reset=0;
         while(x)
         {
            delay_ms(50); 

            clear_buffer_rx(); 
            #asm("cli")
           cnt_= (eep_flags-1);
           data_f_buff = eep_fills[cnt_]; // копируем в ОЗУ данные из еепром 
           data_ts_buff = eep_ts[cnt_];
           flags_err_ts=eep_err_ts[cnt_]; 
            #asm("sei")
            
                printf(http_post_data0);  
                printf("%i", (9 + 1 + (sizeof(json_data_vcc)-1) + reads(data_ts_buff) + reads(timestamp) + reads(data_f_buff) + 28 + (sizeof(json_data_ctrl_dt)-1) + reads(vcc/20) + reads(vcc%20))); // размер данных json
                
                printf(http_post_data1);
                
                #asm("cli")
              cnt_= (eep_flags-1);
              data_f_buff = eep_fills[cnt_]; // копируем в ОЗУ данные из еепром 
              data_ts_buff = eep_ts[cnt_];
              flags_err_ts=eep_err_ts[cnt_]; 
               #asm("sei") 
                
                 printf(json_data_sn);
                 for(x=0; x<4; x++){ id[x] = eep_id[x]; printf("%02X",id[x]);}
                 printf(json_data_dt);
                 printf("%lu",timestamp);
                 printf(json_data_ctrl_dt);
                 printf("%lu", data_ts_buff); // timestamp во время наливов
                 printf(json_data_f);
                 printf("%lu", data_f_buff); // fills
                 printf(json_data_vcc);
                 printf("%d.%d", vcc/20, vcc%20);
                 printf(json_data_end);
                 printf("%d}",flags_err_ts);
              delay_ms(700); 
              delay_ms(500);
             read_tcp_data();
              if(read_http_status()==0) { clear_buffer_rx(); eep_flags--; eep_ts[cnt_]=0; if(eep_flags)sek_buff=20; return 0;} // No error
             else
             {
              RESET_ESP=1;
              x=0; 
              sek_buff=0; // повтор через 20сек.
                 sleep_start(0x02); 
                 return 0;
             }
             x=0;
         }
     }
     else
     { 
       printf("E09\r\n");
       delay_ms(50);
       RESET_ESP=1;
       sek_buff=0; // повтор через 20сек.
       sleep_start(0x02); 
      return 0;
     }  
        delay_ms(600);
 }
}

void read_timestamp()// чтение таймстемп в переменную 
{
char a=0, x=1;
unsigned long int k=0, y=0, z=0, addr_timestamp=0;
unsigned long int data_ts[40];
unsigned long int data_ts_=0;
       
      if(flg&0x01) reset_chip();
if(at_start())
{
       timer_reset=0;
 if(conn_to_wifi()==0) 
  {
   tcp_conn(); 
   printf(tcp_send1);
   printf("%d", (sizeof(http_get_timestamp)-1));  // вычисляем размер буфера             
   printf(",%c:", conn_id_t); // дошел сюда  conn_id_t  flash char tcp_send2[]=",0:";
       timer_reset=0; 
        while(x)
         {
            delay_ms(500); 
             clear_buffer_rx();
             delay_ms(300); 
             
                   printf(http_get_timestamp); // запрашиваем данные таймстемп
                   delay_ms(500);
                 read_tcp_data();  
                 delay_ms(1000);
             if(string_search("HTTP/1.1 200 OK",rx_buffer))
             { 
                   addr_timestamp = (string_search("\"ts\":",rx_buffer)); // поиск таймстемп данных
                
                    if(addr_timestamp) // обработчик строки
                    {
                      while(a<10 && (rx_buffer[addr_timestamp]>47 && rx_buffer[addr_timestamp]<59))
                      {
                          a++; data_ts[y++] = (rx_buffer[addr_timestamp++]-48);
                         
                      }
                      
                      k=y;
                      while(y)  // получаем число из строки символов
                      {    
                        k=y;
                        k--;
                           while(k)
                           {
                            if(y) data_ts[z] = data_ts[z] * 10;
                            k--;
                           }
                           data_ts_+=data_ts[z];
                        y--;
                        
                         
                         z++;   
                      }
                      
                      timestamp = data_ts_;
                           flags_err_timestamp=0;
                      //clear_buffer_rx();
                      RESET_ESP=1;
                      printf("TSO=%lu\r\n", timestamp);
                      delay_ms(50);
                      clear_buffer_rx();
                       
                      h=0;
                      sleep_start(0x01);
                      sleep_en();
                      x=0;
                        //return 0;
                    }
                else
                { 
                RESET_ESP=1;
                 printf("E01\r\n");
                 delay_ms(50);
                  sleep_start(0x01);
                 h=4;
                  
                   sleep_en();
                  x=0;
                   //return 0;
                }     
               x=0;
             }
              else
                {
                RESET_ESP=1; 
                 printf("E02\r\n");// err timestamp
                 delay_ms(50);
                  
                   sleep_start(0x01);
                    h=4;
                   sleep_en();
                  x=0;
                   //return 0;
                }
           
         }
  }
  else
  {
   printf("E10\r\n");
   delay_ms(50);
     
   sleep_start(0x01);
    h=4;
   sleep_en();
   //return 0; //return 1;
  }
  }
  
}

char sizeof_ram(char *ram)
{
char x=0;
ram+=0;
while(ram[x]!=0)ram[x++];
return x;
}

void read_chip_info()
{
     char addr=0, x=0,y=0;
printf("ATW?\r\n");
delay_ms(2000);
addr = string_search("STA,",rx_buffer);
for(x=addr; x<(addr+100); x++) // читаем ай-пи в буфер
{
     if(rx_buffer[x]!=0 && rx_buffer[x]!=0xFF\
      && rx_buffer[x]!='[' && rx_buffer[x]!=']'\
      && rx_buffer[x]!='{' && rx_buffer[x]!='}'\
      && rx_buffer[x]!='\r' && rx_buffer[x]!='\n') 
      { sta_data[y] = rx_buffer[x]; }
     else 
      { x=(addr+100); }
     y++;     
}
 delay_ms(1000);    
}

char set_pings() 
{
char id[4] , x=1;
   if(flg&0x04) reset_chip();
   timer_reset=0;
   x=1;
 while(x)
 {
  if(conn_to_wifi()==0)  
  {
   x=0;
  }
  else
  { 
     RESET_ESP=1;
   printf("E10\r\n");
   delay_ms(50);
   x=30;
   sleep_start(0x04); 

   sleep_en();
    return 0;  
     // goto exit0;
  }
 }
 x=2; 
   while(x)
   {
    delay_ms(100);
     read_chip_info(); // получаем данные о подключении   
     tcp_conn(); 
     clear_buffer_rx();
    printf(tcp_send1);
    vcc = read_adc(0);
    printf("%d", (5 + 1 + sizeof(json_data_vcc)-1 + sizeof(http_set_pings)-1) + sizeof(http_post_data1)-1 + (sizeof(http_set_pings1)-1 + sizeof(http_set_pings3)-1 + sizeof(json_data_dt)-1 + sizeof(json_data_sn)-1 + sizeof_ram(sta_data) + 8 + reads(timestamp) + reads(vcc/20) + reads(vcc%20)));  // вычисляем размер буфера             
    printf(",%c:", conn_id_t); // дошел сюда  conn_id_t  flash char tcp_send2[]=",0:";  
     
      timer_reset=0; 
         
            delay_ms(200); 
             printf(http_set_pings);
                printf("%d", (2 + 1 + reads(vcc/20) + reads(vcc%20) + sizeof(json_data_vcc)-1 + sizeof(http_set_pings1)-1 + sizeof(http_set_pings3)-1 + sizeof(json_data_dt)-1 + sizeof(json_data_sn)-1 + sizeof_ram(sta_data) + 8 + reads(timestamp)));
                
                printf(http_post_data1); // \r\n - перед данными , два переноса не входят в размер данных!
                
                 printf(json_data_sn);
                 //delay_ms(1000);
                 for(x=0; x<4; x++){ id[x] = eep_id[x]; printf("%02X",id[x]);}
                 printf(json_data_dt);
                 printf("%lu",timestamp);
                 printf(json_data_vcc);
                 printf("%d.%d", vcc/20, vcc%20);
                     printf(http_set_pings1);
                     printf("%s", sta_data);
                     printf(http_set_pings3);
                 printf("%d}",flags_err_timestamp);                     
             read_tcp_data();
         
             if(read_http_status()==0) return 0;
             else
             {
              RESET_ESP=1;
              printf("EHTTP\r\n");
              delay_ms(50);
              sleep_start(0x04); 

              sleep_en();
              return 0;//return 1;
             }
             x=0; 
   }

  
   //sleep_en();
}

void reload_data()
{

if((flg&0x01)==0x01)
{
 read_timestamp(); // считываем таймстемп
  flg&=~0x01; 
  delay_ms(500);
}
if((flg&0x02)==0x02)
{
if(data_f)
{
 if(transfer()==0) // отправляем наливы на сервер 
  {
   flg&=~0x02;
  }
} 
 if(fills_buff()==0)
  {
   flg&=~0x02;
  }
  delay_ms(500);
}
if((flg&0x04)==0x04)
{
 if(set_pings()==0) // отсылаем пинги на сервер 
  {flg&=~0x04;}
}
  if(flg==0)
  {
   if(++timer_reset>200)
   {
     if(timer_reset==201)printf("RCP\r\n");
      delay_ms(100);
     RESET_ESP=1; // RESET ESP ON
     timer_reset=202;
     sleep_en();
   }
  }
  else
  {
   timer_reset=0;
  }
}

void main(void)
{
// Declare your local variables here

// Input/Output Ports initialization
// Port A initialization
// Func7=In Func6=In Func5=In Func4=In Func3=In Func2=In Func1=In Func0=In 
// State7=T State6=T State5=T State4=T State3=T State2=T State1=T State0=T 
PORTA=0x00;
DDRA=0x00;

// Port B initialization
// Func7=In Func6=In Func5=In Func4=In Func3=In Func2=In Func1=In Func0=In 
// State7=T State6=T State5=T State4=T State3=T State2=T State1=T State0=T 
PORTB=0x00;
DDRB=0x01;

// Port C initialization
// Func7=In Func6=In Func5=In Func4=In Func3=In Func2=In Func1=In Func0=In 
// State7=T State6=T State5=T State4=T State3=T State2=T State1=T State0=T 
PORTC=0x00;
DDRC=0x00;

// Port D initialization
// Func7=In Func6=In Func5=In Func4=In Func3=In Func2=In Func1=In Func0=In 
// State7=T State6=T State5=T State4=T State3=T State2=T State1=T State0=T 
PORTD=0x04;
DDRD=0x08;

// Timer/Counter 0 initialization
// Clock source: System Clock
// Clock value: Timer 0 Stopped
// Mode: Normal top=0xFF
// OC0 output: Disconnected
TCCR0=0x00;
TCNT0=0x00;
OCR0=0x00;

// Timer/Counter 1 initialization
// Clock source: System Clock
// Clock value: Timer1 Stopped
// Mode: Normal top=0xFFFF
// OC1A output: Discon.
// OC1B output: Discon.
// Noise Canceler: Off
// Input Capture on Falling Edge
// Timer1 Overflow Interrupt: Off
// Input Capture Interrupt: Off
// Compare A Match Interrupt: Off
// Compare B Match Interrupt: Off
TCCR1A=0x00;
TCCR1B=0x00;
TCNT1H=0x00;
TCNT1L=0x00;
ICR1H=0x00;
ICR1L=0x00;
OCR1AH=0x00;
OCR1AL=0x00;
OCR1BH=0x00;
OCR1BL=0x00;

// Timer/Counter 2 initialization
// Clock source: TOSC1 pin
// Clock value: PCK2/128
// Mode: Normal top=0xFF
// OC2 output: Disconnected
ASSR=0x08;
TCCR2=0x05;
TCNT2=0x00;
OCR2=0x00;

// External Interrupt(s) initialization
// INT0: On
// INT0 Mode: Falling Edge
// INT1: Off
// INT2: Off
GICR|=0x40;
MCUCR=0x02;
MCUCSR=0x00;
GIFR=0x40;

// Timer(s)/Counter(s) Interrupt(s) initialization
TIMSK=0x40;

// USART initialization
// Communication Parameters: 8 Data, 1 Stop, No Parity
// USART Receiver: On
// USART Transmitter: On
// USART Mode: Asynchronous
// USART Baud Rate: 38400
UCSRA=0x00;
UCSRB=0x98;
UCSRC=0x86;
UBRRH=0x00;
UBRRL=0x02;

// ADC initialization
// ADC Clock frequency: 57,600 kHz
// ADC Voltage Reference: AREF pin
// Only the 8 most significant bits of
// the AD conversion result are used
ADMUX=ADC_VREF_TYPE & 0xff;
ADCSRA=0x85;

// SPI initialization
// SPI disabled
SPCR=0x00;

// TWI initialization
// TWI disabled
TWCR=0x00;
flg=0x81;
        RESET_ESP=1; // RESET ESP OFF

// Global enable interrupts
#asm("sei")
delay_ms(1000);
      printf("System start!\r\n");
      vcc = read_adc(0);
      printf("Vcc = %d.%d\r\n", vcc/20, vcc%20);
     flags_err_timestamp=2; 
     flg|=0x04;
     flg|=0x01;
     if(eep_flags==0xFF)eep_flags=0;
     if(eep_flags)sek_buff=20; // отправляем наливы из буфера 
     delay_ms(200);
while (1)
      {
                reload_data();
         delay_ms(100); 
//            if(++demo_mode>9000) 
//            {
//                 printf("Demo mode start!\r\n");
//                 while(demo_mode);
//            }
      }
}
