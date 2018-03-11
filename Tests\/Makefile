CXX = g++
CFLAGS = -std=c++14 -g -Wall

%.o : %.cpp
	$(CXX) -c $(CXXFLAGS) $<

# Add any additional targets you may have here
test.exe: test1.o
	$(CXX) -o $@ $^

game-memcheck: test.exe
		valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./test.exe
clean:
	$(RM) $(wildcard *.exe) $(wildcard *.o)
