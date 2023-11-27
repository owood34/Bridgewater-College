#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>
#include <pthread.h>
#include <unistd.h>

#define LENGTH 3

struct gameInfo {
	char board[LENGTH][LENGTH];
	int row;
	int col;
	bool isPlayerOne; 
};

int playerWins = 0;

void printBoard(char[][LENGTH]);
void* playerOne(void*);
void* playerTwo(void*);
bool gameOver(char[][LENGTH]);
int rowCheck(bool, int, char[][LENGTH]);
int diaCheck(bool, char[][LENGTH]);
bool containsBlank(char[][LENGTH]);

int main() {
	struct gameInfo info;
	for (int x = 0; x < LENGTH; x++) {
		for (int y = 0; y < LENGTH; y++) {
			info.board[x][y] = ' ';
		}
	}
	info.isPlayerOne = true;
	info.row = 0;
	info.col = 0;
	system("clear");
	printBoard(info.board);
	pthread_t pOne;
	if (pthread_create(&pOne, NULL, playerOne, &info)) {
		printf("ERROR CREATING PLAYER 1!\n");
		return 1;
	}
	pthread_t pTwo;
	if (pthread_create(&pTwo, NULL, playerTwo, &info)) {
		printf("ERROR CREATING PLAYER 2!\n");
		return 1;
	}
	while(!gameOver(info.board)) {
		sleep(2);
	}
	if (!containsBlank(info.board) && playerWins == 0) {
		printf("NO PLAYER WINS!\n");	
	}
	if (playerWins == 1) {
		printf("PLAYER ONE WINS!\n");
	} else if (playerWins == -1) {
		printf("PLAYER TWO WINS!\n");
	}	
}

void printBoard(char board[][LENGTH]) {
	for (int x = 0; x < LENGTH; x++) {
		for (int y = 0; y < LENGTH; y++) {
			if (x != LENGTH - 1) {
				if (y != LENGTH - 1) {
					printf("\033[4m%c|\033[24m", board[x][y]);
				} else {
					printf("\033[4m%c\033[24m", board[x][y]);
				}
			} else {
				if (y != LENGTH - 1) {
					printf("%c|", board[x][y]);
				} else {
					printf("%c", board[x][y]);
				}
			}
		}
		printf("\n");
	} 
}

void* playerOne(void* args) {
	struct gameInfo* game = (struct gameInfo*) args;
	while(!gameOver(game->board)) {
		while (!(game->isPlayerOne)) {
			sleep(2);
		}
		printf("Player One Turn!\n");
		printf("Which row do you want to place\n");
		scanf("%d", &(game->row));
		printf("Which column do you want to place\n");
		scanf("%d", &(game->col));
		system("clear");
		if (game->row >= LENGTH || game->col >= LENGTH) {
			printf("ERROR OUT OF BOUNDS EXCEPTION!\n");
			exit(1);
		}
		if (game->board[game->row][game->col] != ' ') {
			printf("CANNOT PLACE PIECE ON TOP OF OTHER PIECE!\n");
			exit(1);
		}
		game->board[game->row][game->col] = 'X';
		
		if(!gameOver(game->board)){
			game->isPlayerOne = false;
			printBoard(game->board);
		}
	}	
}

void* playerTwo(void* args) {
	struct gameInfo* game = (struct gameInfo*) args;
	while(!gameOver(game->board)) {
		while (game->isPlayerOne) {
			sleep(2);
		}
	
		printf("Player Two Turn!\n");
		printf("Which row do you want to place\n");
		scanf("%d", &(game->row));
		printf("Which column do you want to place\n");
		scanf("%d", &(game->col));
		system("clear");
		if (game->row >= LENGTH || game->col >= LENGTH) {
			printf("ERROR OUT OF BOUNDS EXCEPTION!\n");
			exit(1);
		}
		if (game->board[game->row][game->col] != ' ') {
			printf("CANNOT PLACE PIECE ON TOP OF OTHER PIECE\n");
			exit(1);
		}
		game->board[game->row][game->col] = 'O';
		
		if(!gameOver(game->board)) {
			game->isPlayerOne = true;
			printBoard(game->board);
		}
	}	
}

bool gameOver(char board[][LENGTH]) {
	for (int i = 0; i < LENGTH; i++) {
		if (rowCheck(true, i, board) == LENGTH) {
			playerWins = 1;
			return true;
		} else if (rowCheck(true, i, board) == -1 * LENGTH) {
			playerWins = -1;
			return true;			
		}
		if (rowCheck(false, i, board) == LENGTH) {
			playerWins = 1;
			return true;
		} else if (rowCheck(false, i, board) == -1 * LENGTH) {
			playerWins = -1;
			return true;
		}
		
	}
	if (diaCheck(true, board) == LENGTH) {
		playerWins = 1;
		return true;
	} else if (diaCheck(true, board) == -1 * LENGTH) {
		playerWins = -1;
		return true;
	}
	if (diaCheck(false, board) == LENGTH) {
		playerWins = 1;
		return true;
	} else if (diaCheck(false, board) == -1 * LENGTH) {
		playerWins = -1;
		return true;
	}

	if (!containsBlank(board)) {
		return true;
	}

	return false;
}

int rowCheck(bool isCheckingRow, int row, char board[][LENGTH]) {
	int count = 0;
	for (int i = 0; i < LENGTH; i++) {
		if (isCheckingRow) {
			if (board[row][i] == 'X') {
				count++;	
			} else if (board[row][i] == 'O') {
				count--;
			}
		}
		if (board[i][row] == 'X') {
			count++;	
		} else if (board[i][row] == 'O') {
			count--;
		}
	}
	return count;
}

int diaCheck(bool isDown, char board[][LENGTH]) {
	int count = 0;
	if (isDown) {
		for (int i = 0; i < LENGTH; i++) {
			if (board[i][i] == 'X') {
				count++;
			} else if (board[i][i] == 'O') {
				count--;
			}			
		}
		return count;
	}
	for (int i = 0; i < LENGTH; i++) {
		if (board[i][LENGTH - i] == 'X') {
			count++;
		} else if (board[i][LENGTH - i] == 'O') {
			count--;
		}		
	}
	return count;
}

bool containsBlank(char board[][LENGTH]) {
	for (int i = 0; i < LENGTH; i++) {
		for (int j = 0; j < LENGTH; j++) {
			if (board[i][j] == ' ') {
				return true;
			}
		}
	}
	return false;
}