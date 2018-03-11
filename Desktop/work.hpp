#include <iostream>
#include <string>

using namespace std;

class Student
{
    
    public:
    Student();
    virtual ~Student();
    private:
    string firstName;
    string lastName;
    int age;
    bool SetAge(int);
    
    void getAge();
    
}

