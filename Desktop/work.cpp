#include "work.hpp"

Student::Student()
{

}
Student::~Student(){

}

void Student::getAge(){
    bool validAge=false;
    if (age<0){
            cout << "Please enter the Students age: "<<endl;
            while(!validAge){ // ensures valid int input
            cout << "Please enter the Students age: " <<endl;
            cin >>age;
            if (cin.fail()){
                cin.clear();  
                cin.ignore(256, '\n');
                validAge =false;
            }   
            cout<<endl;
        }
    }
}