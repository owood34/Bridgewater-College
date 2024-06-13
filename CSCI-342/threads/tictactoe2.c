#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdbool.h>
#include <pthread.h>
#include <sys/sem.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <string.h>
#include <errno.h>
#include <limits.h>

void printError(char*, int);
void initializeSemaphore(int);
void printBoard(char[3][3]);

void* player(void*);
void* computer(void*);

int getSemaphoreID();
int getSemaphoreValue(int);
void switchPlayer(int);

bool isGameOver(void*);
int rowColCount(char[3][3], int, bool);
int diagonalCount(char[3][3], bool);

struct gameInfo {
	char board[3][3];
	int row;
	int col;
	int playerWins;
	int emptyTiles;
	int semid;
};

int main() {
	srand(time(0) + 1);
	struct gameInfo info;
	for (int x = 0; x < 3; x++) {
		for (int y = 0; y < 3; y++) {
			info.board[x][y] = ' ';
		}
	}
	info.row = 0;
	info.col = 0;
	info.playerWins = 0;
	info.emptyTiles = 9;

	info.semid = getSemaphoreID();
	initializeSemaphore(info.semid);
	switchPlayer(info.semid);
		
	system("clear");
	printBoard(info.board);

	pthread_t p;
	if (pthread_create(&p, NULL, player, &info) != 0) {
		printError("Could not Create Player", errno);
	}
	
	pthread_t cpu;
	if (pthread_create(&cpu, NULL, computer, &info) != 0) {
		printError("Could not Create Computer", errno);
	}
	while(!(isGameOver(&info))) {
		sleep(1);
	}
	if (info.emptyTiles == 0 && info.playerWins == 0) {
		printf("CAT!\n");
	}
	
	if (info.playerWins < 0) {
		printf("CPU WINS!\n");
	}

	if (info.playerWins > 0) {
		printf("PLAYER WINS\n");
	}
}

void printBoard(char board[3][3]) {
	for (int x = 0; x < 3; x++) {
		for (int y = 0; y < 3; y++) {
			if (x != 2) {
				if (y != 2) {
					printf("\033[4m%c|\033[24m", board[x][y]);
				} else {
					printf("\033[4m%c\033[24m", board[x][y]);				     
				}
			} else {
				if (y != 2) {
					printf("%c|", board[x][y]);	
				} else {
					printf("%c", board[x][y]);
				}
			}
		}
		printf("\n");	
	}
}

void* player(void* args) {
	struct gameInfo* game = (struct gameInfo*) args;
	while(!isGameOver(game)) {
		while(getSemaphoreValue(game->semid) != 1) {
			sleep(1);
		}
		printf("YOUR TURN\n");
		printf("Which row do you want to place? ");
		scanf("%d", &(game->row));
		printf("Which column do you want to place? ");
		scanf("%d", &(game->col));
		system("clear");
		if (game->row >= 3 || game->col >= 3) {
			printError("OUT OF BOUNDS", errno);
		}
		if (game->board[game->row][game->col] != ' ') {
			printError("CANNOT PLACE A PIECE ON ANOTHER PIECE", 0);
		}
		game->board[game->row][game->col] = 'X';
		game->emptyTiles--;
		if (!isGameOver(game)) {
			switchPlayer(game->semid);
			printBoard(game->board);
		}
	}	
}

void* computer(void* args) {
	struct gameInfo* game = (struct gameInfo*) args;
	while(!isGameOver(game)) {
		while(getSemaphoreValue(game->semid) != 2) {
			sleep(1);
		}	
		int options[3][3];
	
		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < 3; j++) {
				options[i][j] = -10;
			}
		}
	
		if (game->board[1][1] == ' ') {
			options[1][1] = 1;
		}

		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < 3; j++) {
			// Checking Forced Positions
				if (game->board[i][j] == ' ' && options[i][j] == -10) {
					options[i][j] = -5;
					if (i != 1 && j != 1) {
						options[i][j] = -3;
					}
				}
				
				int row = rowColCount(game->board, i, true);
				if (abs(row) == 2) {
					if (game->board[i][j] == ' ') {
						if (row == -2) {
							options[i][j] = -(row+1);
						} else {
							options[i][j] = row;
						}
					}
				}
				int col = rowColCount(game->board, i, false);
				if (abs(col) == 2) {
					if (game->board[j][i] == ' ') {
						if (col == -2) {
							options[j][i] = -(col+1);
						} else {
							options[j][i] = col;
						}
					}
				} 
			}
		}

		int diagonal1 = diagonalCount(game->board, false);
		int diagonal2 = diagonalCount(game->board, true);
		if (abs(diagonal1) == 2 || abs(diagonal2) == 2) {
			for (int i = 0; i < 3; i++) {
				if (abs(diagonal2) == 2) {
					if (game->board[i][i] == ' ') {
						options[i][i] = diagonal2;
					}
				} 
				if (abs(diagonal1) == 2) {
					if (game->board[i][2 - i] == ' ') {
						options[i][2 - i] = diagonal1;
					}		
				}
			}
		}
		
		int best_row = 0;
		int best_col = 0;
		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < 3; j++) {
				if (options[i][j] > options[best_row][best_col]) {
					best_row = i;
					best_col = j;	
				}
				//printf("Option at %d, %d: %d\n", i, j, options[i][j]);
			}
		}
		
		system("clear");
		game->board[best_row][best_col] = 'O';	
		game->emptyTiles--;
		if (!isGameOver(game)) {
			switchPlayer(game->semid);
			printBoard(game->board);
		}
	}	
}

int getSemaphoreID() {
	char *filepath = "/tmp/sema";
	int tokid = 0;
	key_t key;
	int semid;

	if ((key = ftok(filepath, tokid)) == -1)
		printError("Can not create token", errno);

	if ((semid = semget(key, 1, 0666 | IPC_CREAT)) == -1)
		printError("Can not create semaphore", errno);


	return semid;
}

void initializeSemaphore(int semid) {
	union semun {
		int val;
		struct semid_ds* buf;
		ushort* array;
	} arg;

	arg.val = 0;
	
	if ((semctl(semid, 0, SETVAL, arg)) == -1)
		printError("Error setting semaphore to 0", errno);
}

int getSemaphoreValue(int semid) {

	int semValue;
	if ((semValue = semctl(semid, 0, GETVAL)) == -1)
		printError("Error getting semaphore value", errno);

	return semValue;
}

void switchPlayer(int semid) {
	struct sembuf op[1];
	int retval;
	op[0].sem_num = 0;
	op[0].sem_flg = 0;

	if (getSemaphoreValue(semid) == 0) {
		double random = rand() % 2;
		op[0].sem_op = (random == 0) ? 1 : 2;
	} else {
		op[0].sem_op = (getSemaphoreValue(semid) == 1) ? 1 : -1;
	}

	if ((retval = semop(semid, op, 1) == -1)) {
		printError("Error with setting Semaphore!", errno);
	}
}

bool isGameOver(void* args) {
	struct gameInfo* game = (struct gameInfo*) args;
	for (int i = 0; i < 3; i++) {
		if (abs(rowColCount(game->board, i, false)) == 3) {
			game->playerWins = rowColCount(game->board, i, false) / 3;
			return true;
		}
		if (abs(rowColCount(game->board, i, true)) == 3) {
			game->playerWins = rowColCount(game->board, i, true) / 3;
			return true;
		}
	}
	
	if (abs(diagonalCount(game->board, false)) == 3) {
		game->playerWins = diagonalCount(game->board, false) / 3;
		return true;
	}
	
	if (abs(diagonalCount(game->board, true)) == 3) {
		game->playerWins = diagonalCount(game->board, true) / 3;
		return true;
	}
	
	if (game->emptyTiles == 0) {
		return true;
	}
	return false;
}

int rowColCount(char board[3][3], int row, bool isCheckingRow) {
	int count = 0;
	for (int i = 0; i < 3; i++) {
		if (isCheckingRow) {
			if (board[row][i] == 'X') {
				count++;
			} else if (board[row][i] == 'O'){
				count--;
			}
		} else {
			if (board[i][row] == 'X') {
				count++;
			} else if (board[i][row] == 'O') {
				count--;
			}
		}
	}
	return count;
}

int diagonalCount(char board[3][3], bool isDown) {
	int count = 0;
	for (int i = 0; i < 3; i++) {
		if (isDown) {
			if (board[i][i] == 'X') {
				count++;
			} else if (board[i][i] == 'O') {
				count--;
			}
		} else {
			if (board[i][2 - i] == 'X') {
				count++;
			} else if (board[i][2 - i] == 'O') {
				count--;
			}
		}
	}
	return count;
}

void printError (char* str, int err) {
	printf("%s: %s\n", str, strerror(err));
	exit(1);
}
