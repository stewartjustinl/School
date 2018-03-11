CXX = g++
CFLAGS = -std=c++14 -g -Wall

%.o : %.cpp
	$(CXX) -c $(CXXFLAGS) $<

# Add any additional targets you may have here
test-game.exe: game.o test-game.o
	$(CXX) -o $@ $^

game-memcheck: test-game.exe
		valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./test-maze.exe
clean:
	$(RM) $(wildcard *.exe) $(wildcard *.o)
