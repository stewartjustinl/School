int main(void)
{
DDRB |= 1 << PINB0; //For Notes on what these actions mean
PORTB ^= 1 << PINB0;
DDRB |= 1 << PINB2;
DDRB &= ~(1 << PINB1);
PORTB |= 1 << PINB1;

int Pressed = 0;
int Pressed_Confidence_Level = 0; //Measure button press cofidence
int Released_Confidence_Level = 0; //Measure button release confidence

while (1)
{
if (bit_is_clear(PINB, 1))
{
Pressed_Confidence_Level ++; //Increase Pressed Conficence
Released_Confidence_Level = 0; //Reset released button confidence since there is a button press
if (Pressed_Confidence_Level >500) //Indicator of good button press
{
if (Pressed == 0)
{
PORTB ^= 1 << PINB0;
PORTB ^= 1 << PINB2;
Pressed = 1;
}
//Zero it so a new pressed condition can be evaluated
Pressed_Confidence_Level = 0;
}
}
else
{
Released_Confidence_Level ++; //This works just like the pressed
Pressed_Confidence_Level = 0; //Reset pressed button confidence since the button is released
if (Released_Confidence_Level >500
{
Pressed = 0;
Released_Confidence_Level = 0;
}
}
}
}