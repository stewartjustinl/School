#include <avr/io.h> //standard io header for arduino
#include <util/delay.h> // header needed for delays such as blink
#include <avr/interrupt.h>

int main(){
  
}

/*
need to design    one function 
for a 1/2 press that activates 
the focus on the camera and a then full press to take the picture
*/
void takePicture(){

}

void buttonInterupt(){

}
/* need this function to be called to tell the board to ignore the 
    on the hardware ascpect what are we using to debounce the button after pressed
*/
void buttonDequeing(){
    bool pressed = false;
    DDRB |= 1 << PINB0; // Data Direction Register output PINB0
    
    DDRB &= ~(1 << PINB1); // Data Direction Register output PINB1
    PORTB |= 1 << PINB1; // set PINB1 to a high reading
    While (1){
        if(bit_is_clear(PINB, 1)){
        _delay_ms(10); // delays between toggling pin. need to find which pin to set
            if (pressed = false){
                PORTB ^= << PINB0;
                PORTB ^= << PINB2;
                pressed = true;
            }
        else (pressed = false);
    }
} 
/* this needs to send a signal to the correct pin to tell it to change
 the status to start the panaramic photos
*/
void power(){
    PORTB ^= << PINB0; // Used to toggle pin 0 on portb. need actual pin and port for function to work properly

}